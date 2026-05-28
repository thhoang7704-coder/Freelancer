package com.example.freelancer.module.Payment.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ForbiddenException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.PaymentGatewayStatus;
import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.enums.UserRole;
import com.example.freelancer.module.Payment.dto.PaymentDetailResponse;
import com.example.freelancer.module.Payment.dto.PaymentDistributionDto;
import com.example.freelancer.module.Payment.dto.PaymentInitiateResponse;
import com.example.freelancer.module.Payment.dto.PaymentLogDto;
import com.example.freelancer.module.Payment.entity.Payment;
import com.example.freelancer.module.Payment.entity.PaymentDistribution;
import com.example.freelancer.module.Payment.entity.PaymentRule;
import com.example.freelancer.module.Payment.repository.PaymentRepository;
import com.example.freelancer.module.Payment.repository.PaymentRuleRepository;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.company.repository.CompanyRepository;
import com.example.freelancer.module.notification.service.NotificationService;
import com.example.freelancer.module.transaction.entity.PaymentTransaction;
import com.example.freelancer.module.transaction.repository.PaymentDistributionRepository;
import com.example.freelancer.module.transaction.repository.PaymentTransactionRepository;
import com.example.freelancer.module.transaction.service.DistributionService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {
        private final PaymentRepository paymentRepository;
        private final VNPayService vnpayService;
        private final CompanyRepository companyRepository;
        private final ProjectRepository projectRepository;
        private final PaymentTransactionRepository paymentTransactionRepository;
        private final DistributionService distributionService;
        private final PaymentDistributionRepository distributionRepository;
        private final PaymentRuleRepository paymentRuleRepository;
        private final NotificationService notificationService;
        private final ProjectMemberRepository projectMemberRepository;
        private final UserRepository userRepository;

        // Khởi tạo thanh toán cho một project, trả về URL thanh toán của VNPAY để
        // frontend redirect người dùng đến đó
        @Transactional
        @Override
        public PaymentInitiateResponse initiatePayment(
                        UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Company company = companyRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Company not found"));

                Project project = projectRepository
                                .findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Project not found"));

                if (!project.getCompany()
                                .getId()
                                .equals(company.getId())) {

                        throw new ForbiddenException(
                                        "Không phải project của bạn");
                }

                if (project.getProgressStatus() != ProgressStatus.DONE) {

                        throw new BadRequestException("404",
                                        "Project chưa hoàn thành");
                }

                boolean paid = paymentRepository
                                .existsByProjectIdAndPaymentStatus(
                                                projectId,
                                                PaymentStatus.PAID);

                if (paid) {
                        throw new BadRequestException("404",
                                        "Project đã thanh toán");
                }
                String paymentCode = "PAY-" + System.currentTimeMillis();
                PaymentRule rule = paymentRuleRepository.findActiveRule()
                                .orElseThrow(() -> new RuntimeException("No active rule"));
                Payment payment = new Payment();

                payment.setProject(project);
                payment.setCompany(company);
                payment.setTotalAmount(
                                project.getBudget());
                // snapshot percent để đảm bảo sau này dù rule có thay đổi thì vẫn tính đúng cho
                // các payment đã tạo
                payment.setAdminPercent(
                                rule.getAdminPercent());

                payment.setLeaderPercent(
                                rule.getLeaderPercent());

                payment.setPaymentStatus(
                                PaymentStatus.PENDING);
                payment.setTxnRef(paymentCode);
                payment.setPaymentCode(paymentCode);

                paymentRepository.save(payment);

                // thông báo cho tất cả thành viên dự án
                List<ProjectMember> members = projectMemberRepository
                                .findByProjectId(project.getId());

                for (ProjectMember member : members) {

                        notificationService.createNotification(
                                        member.getFreelancer().getUser(),
                                        "Dự án đã được thanh toán",
                                        "Dự án \"" + project.getName()
                                                        + "\" đã được công ty thanh toán thành công với số tiền "
                                                        + project.getBudget() + " VND",
                                        NotificationType.PROJECT_PAID,
                                        project.getId());
                }
                // notification cho admin
                List<User> admins = userRepository.findByRole(UserRole.ADMIN);

                for (User admin : admins) {

                        notificationService.createNotification(
                                        admin,
                                        "Công ty đã thanh toán dự án",
                                        "Công ty \"" + company.getCompanyName()
                                                        + "\" đã thanh toán dự án \""
                                                        + project.getName()
                                                        + "\" với số tiền "
                                                        + project.getBudget() + " VND",
                                        NotificationType.PROJECT_PAID,
                                        project.getId());
                }
                // tạo URL thanh toán VNPAY
                String paymentUrl = vnpayService.createPaymentUrl(payment);

                return PaymentInitiateResponse.builder()
                                .paymentId(payment.getId())
                                .projectId(project.getId())
                                .totalAmount(payment.getTotalAmount())
                                .status(payment.getPaymentStatus())
                                .vnpayUrl(paymentUrl)
                                .createdAt(payment.getCreatedAt())
                                .build();
        }

        // call back xử lý sau khi thanh toán xong, vnpay sẽ gọi lại api này với các
        // params để thông báo kết quả thanh toán
        @Transactional
        @Override
        public void handleVnpayReturn(
                        Map<String, String> params) {

                boolean validSignature = vnpayService.verify(params);

                String paymentCode = params.get("vnp_TxnRef");

                Payment payment = paymentRepository
                                .findByPaymentCode(paymentCode)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Payment not found"));

                if (payment.getPaymentStatus() == PaymentStatus.PAID) {
                        return;
                }

                PaymentTransaction transaction = new PaymentTransaction();

                transaction.setPayment(payment);
                transaction.setRawResponse(params.toString());
                transaction.setResponseCode(params.get("vnp_ResponseCode"));
                transaction.setBankCode(params.get("vnp_BankCode"));
                transaction.setVnpayTransactionCode(
                                params.get("vnp_TransactionNo"));

                if (!validSignature) {

                        transaction.setStatus(
                                        PaymentGatewayStatus.INVALID_SIGNATURE);

                        paymentTransactionRepository.save(transaction);

                        return;
                }

                long amount = Long.parseLong(
                                params.get("vnp_Amount")) / 100;

                if (amount != payment.getTotalAmount().longValue()) {

                        transaction.setStatus(
                                        PaymentGatewayStatus.INVALID_AMOUNT);

                        paymentTransactionRepository.save(transaction);

                        return;
                }

                String responseCode = params.get("vnp_ResponseCode");

                if ("00".equals(responseCode)) {

                        transaction.setStatus(
                                        PaymentGatewayStatus.SUCCESS);

                        payment.setPaymentStatus(
                                        PaymentStatus.PAID);

                        Project project = payment.getProject();
                        project.setPaymentStatus(PaymentStatus.PAID);
                        projectRepository.save(project);

                        paymentRepository.save(payment);

                        distributionService
                                        .distributePayment(payment);

                } else {

                        transaction.setStatus(
                                        PaymentGatewayStatus.FAILED);

                        payment.setPaymentStatus(
                                        PaymentStatus.FAILED);

                        Project project = payment.getProject();
                        project.setPaymentStatus(PaymentStatus.UNPAID);
                        projectRepository.save(project);

                        paymentRepository.save(payment);
                }

                paymentTransactionRepository.save(transaction);
        }

        @Override
        public PaymentDetailResponse getPaymentDetail(UUID paymentId) {

                Payment payment = paymentRepository.findById(paymentId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Payment not found"));

                // logs
                List<PaymentLogDto> logs = payment.getTransaction() != null
                                ? List.of(PaymentLogDto.builder()
                                                .vnpayTransactionCode(
                                                                payment.getTransaction().getVnpayTransactionCode())
                                                .status(payment.getTransaction().getStatus())
                                                .rawResponse(payment.getTransaction().getRawResponse())
                                                .build())
                                : List.of();

                // distributions
                List<PaymentDistribution> distributions = distributionRepository.findByPaymentId(paymentId);

                List<PaymentDistributionDto> distributionDtos = distributions.stream()
                                .map(d -> PaymentDistributionDto.builder()
                                                .freelancerId(d.getFreelancer().getId())
                                                .freelancerName(d.getFreelancer().getUser().getFullName())
                                                .amount(d.getAmount())
                                                .isLeader(d.isLeader())
                                                .build())
                                .toList();

                // admin amount
                BigDecimal adminAmount = payment.getAdminPercent()
                                .multiply(payment.getTotalAmount())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                // leader amount
                BigDecimal leaderAmount = distributions.stream()
                                .filter(PaymentDistribution::isLeader)
                                .map(PaymentDistribution::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                return PaymentDetailResponse.builder()
                                .paymentId(payment.getId())

                                .projectId(payment.getProject().getId())
                                .projectName(payment.getProject().getName())

                                .companyId(payment.getCompany().getId())

                                .totalAmount(payment.getTotalAmount())

                                .adminPercent(payment.getAdminPercent())
                                .leaderPercent(payment.getLeaderPercent())

                                .adminAmount(adminAmount)

                                .leaderAmount(leaderAmount)

                                .status(payment.getPaymentStatus())

                                .paymentLogs(logs)

                                .distributions(distributionDtos)

                                .createdAt(payment.getCreatedAt())

                                .build();
        }
}
