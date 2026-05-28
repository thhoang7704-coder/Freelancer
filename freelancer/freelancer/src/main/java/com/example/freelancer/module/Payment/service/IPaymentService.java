package com.example.freelancer.module.Payment.service;

import java.util.Map;
import java.util.UUID;

import com.example.freelancer.module.Payment.dto.PaymentDetailResponse;
import com.example.freelancer.module.Payment.dto.PaymentInitiateResponse;

public interface IPaymentService {
        PaymentInitiateResponse initiatePayment(
                        UUID projectId);

        void handleVnpayReturn(
                        Map<String, String> params);

        PaymentDetailResponse getPaymentDetail(UUID paymentId);
}
