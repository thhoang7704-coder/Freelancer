package com.example.freelancer.module.admin.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.PaymentStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecentPaymentResponse {

    private UUID paymentId;

    private String projectName;

    private BigDecimal totalAmount;

    private PaymentStatus status;

    private OffsetDateTime createdAt;
}