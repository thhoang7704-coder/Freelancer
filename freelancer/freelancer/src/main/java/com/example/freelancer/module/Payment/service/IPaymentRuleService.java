package com.example.freelancer.module.Payment.service;

import com.example.freelancer.module.Payment.dto.CreatePaymentRuleRequest;
import com.example.freelancer.module.Payment.dto.PaymentRuleResponse;

public interface IPaymentRuleService {

    PaymentRuleResponse createRule(
            CreatePaymentRuleRequest request);

    PaymentRuleResponse getActiveRule();
}
