package com.example.freelancer.module.Payment.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.freelancer.enums.PaymentStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentDetailResponse {

    private UUID paymentId;
    private UUID projectId;
    private String projectName;
    private UUID companyId;

    private BigDecimal totalAmount;

    private BigDecimal adminPercent;
    private BigDecimal leaderPercent;
    private BigDecimal adminAmount;
    private BigDecimal leaderAmount;

    private PaymentStatus status;

    private List<PaymentLogDto> paymentLogs;
    private List<PaymentDistributionDto> distributions;

    private OffsetDateTime createdAt;
}