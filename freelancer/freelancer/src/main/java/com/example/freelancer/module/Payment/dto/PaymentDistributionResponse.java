package com.example.freelancer.module.Payment.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class PaymentDistributionResponse {

    private UUID freelancerId;
    private String freelancerName;
    private BigDecimal amount;
    private boolean isLeader;
}
