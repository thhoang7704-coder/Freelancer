package com.example.freelancer.module.Payment.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.module.Payment.entity.Payment;
import com.example.freelancer.module.Payment.repository.PaymentRepository;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.transaction.service.DistributionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class VnPayWebhookService implements IVnPayWebhookService {

    private final PaymentRepository paymentRepository;
    private final DistributionService distributionService;
    private final ProjectRepository projectRepository;
    private final org.springframework.core.env.Environment env;

    private final VnPayUtil vnPayUtil;

    public String getDatabaseUrl() {
        return env.getProperty("spring.datasource.url");
    }

    @Override
    @Transactional
    public String processIpn(Map<String, String> params) {

        try {

            String secureHash = params.get("vnp_SecureHash");

            boolean validSignature = vnPayUtil.validateSignature(params, secureHash);

            if (!validSignature) {

                log.error("INVALID SIGNATURE");

                return "{\"RspCode\":\"97\",\"Message\":\"Invalid Signature\"}";
            }

            String txnRef = params.get("vnp_TxnRef");

            Payment payment = paymentRepository
                    .findByTxnRef(txnRef)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            if (payment.getPaymentStatus() == PaymentStatus.PAID) {

                log.info("PAYMENT ALREADY PROCESSED: {}", txnRef);

                return """
                        {
                          "RspCode":"00",
                          "Message":"Already Confirmed"
                        }
                        """;
            }
            String responseCode = params.get("vnp_ResponseCode");

            String transactionStatus = params.get("vnp_TransactionStatus");

            if ("00".equals(responseCode)
                    && "00".equals(transactionStatus)) {

                payment.setPaymentStatus(PaymentStatus.PAID);

                payment.setPaymentCode(
                        params.get("vnp_TransactionNo"));
                Project project = payment.getProject();
                project.setPaymentStatus(PaymentStatus.PAID);
                projectRepository.save(project);
                paymentRepository.save(payment);

                // AUTO DISTRIBUTE
                try {
                    distributionService.distributePayment(payment);
                    log.info("========== IPN DISTRIBUTION SUCCESS ==========");
                } catch (Throwable t) {
                    log.error("========== FATAL ERROR IN IPN DISTRIBUTION ==========", t);
                    throw t;
                }

                log.info("PAYMENT SUCCESS: {}", txnRef);

            } else {

                payment.setPaymentStatus(PaymentStatus.FAILED);
                Project project = payment.getProject();
                project.setPaymentStatus(PaymentStatus.UNPAID);
                projectRepository.save(project);
                log.error("PAYMENT FAILED: {}", txnRef);
            }

            paymentRepository.save(payment);

            return """
                    {
                      "RspCode":"00",
                      "Message":"Confirm Success"
                    }
                    """;

        } catch (Exception e) {

            log.error("IPN ERROR", e);

            return """
                    {
                      "RspCode":"99",
                      "Message":"Unknown Error"
                    }
                    """;
        }
    }

    @Override
    @Transactional
    public void processReturn(Map<String, String> params) {

        String txnRef = params.get("vnp_TxnRef");

        Payment payment = paymentRepository
                .findByTxnRef(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        String responseCode = params.get("vnp_ResponseCode");
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            return;
        }

        if ("00".equals(responseCode)) {

            payment.setPaymentStatus(PaymentStatus.PAID);

            payment.setPaymentCode(
                    params.get("vnp_TransactionNo"));

            Project project = payment.getProject();
            project.setPaymentStatus(PaymentStatus.PAID);
            projectRepository.save(project);
            paymentRepository.save(payment);

            try {
                distributionService.distributePayment(payment);
                log.info("========== DISTRIBUTION SUCCESS ==========");
            } catch (Throwable t) {
                log.error("========== FATAL ERROR IN DISTRIBUTION ==========", t);
                throw t; // Rethrow so it still rolls back if needed
            }
        } else {

            payment.setPaymentStatus(PaymentStatus.FAILED);

            Project project = payment.getProject();
            project.setPaymentStatus(PaymentStatus.UNPAID);
            projectRepository.save(project);
            paymentRepository.save(payment);
        }
    }

}
