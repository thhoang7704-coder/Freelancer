package com.example.freelancer.module.Payment.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRuleResponse {

    private UUID id;

    private BigDecimal adminPercent;

    private BigDecimal leaderPercent;

    private BigDecimal freelancerPercent;

    private boolean active;
}
