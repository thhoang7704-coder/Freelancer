package com.example.freelancer.module.Payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.module.Payment.dto.CreatePaymentRuleRequest;
import com.example.freelancer.module.Payment.service.IPaymentRuleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payment-rules")
@RequiredArgsConstructor
public class PaymentRuleController {

    private final IPaymentRuleService paymentRuleService;

    @PostMapping
    public ResponseEntity<?> createRule(
            @RequestBody CreatePaymentRuleRequest request) {

        return ResponseEntity.ok(
                paymentRuleService.createRule(request));
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveRule() {

        return ResponseEntity.ok(
                paymentRuleService.getActiveRule());
    }
}
