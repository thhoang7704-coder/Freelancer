package com.example.freelancer.module.company.dto;

import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.module.Payment.dto.PaymentDistributionResponse;
import com.example.freelancer.module.Payment.dto.PaymentLogResponse;
import com.example.freelancer.module.transaction.dto.PaymentTransactionResponse;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CompanyPaymentResponse {

    private UUID paymentId;
    private String paymentCode;

    private UUID projectId;
    private String projectTitle;

    private BigDecimal totalAmount;

    private PaymentStatus paymentStatus;

    private String txnRef;

    private BigDecimal adminPercent;
    private BigDecimal leaderPercent;

    private OffsetDateTime createdAt;

    private PaymentTransactionResponse transaction;

    private List<PaymentDistributionResponse> distributions;

    private List<PaymentLogResponse> logs;
}