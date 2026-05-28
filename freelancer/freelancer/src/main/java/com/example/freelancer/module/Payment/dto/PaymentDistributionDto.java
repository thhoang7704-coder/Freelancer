package com.example.freelancer.module.Payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentDistributionDto {
    private UUID freelancerId;
    private String freelancerName;
    private BigDecimal amount;
    private boolean isLeader;
}