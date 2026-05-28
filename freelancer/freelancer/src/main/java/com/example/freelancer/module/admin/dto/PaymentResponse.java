package com.example.freelancer.module.admin.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.PaymentGatewayStatus;
import com.example.freelancer.enums.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {

    private UUID paymentId;

    private String paymentCode;

    private String txnRef;

    private BigDecimal totalAmount;

    private PaymentStatus paymentStatus;

    private BigDecimal adminPercent;

    private BigDecimal leaderPercent;

    private OffsetDateTime createdAt;

    // project
    private UUID projectId;

    private String projectName;

    // company
    private UUID companyId;

    private String companyName;

    // payment transaction
    private UUID paymentTransactionId;

    private String vnpayTransactionCode;

    private PaymentGatewayStatus gatewayStatus;

    private String responseCode;

    private String bankCode;
}