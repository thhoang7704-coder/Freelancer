package com.example.freelancer.module.Payment.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreatePaymentRuleRequest {

    private BigDecimal adminPercent;

    private BigDecimal leaderPercent;

    private BigDecimal freelancerPercent;
}
