package com.example.freelancer.module.transaction.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.module.Payment.entity.Payment;
import com.example.freelancer.module.Payment.repository.PaymentRepository;
import com.example.freelancer.module.transaction.service.interfaces.IDistributionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/distributions")
@RequiredArgsConstructor
public class DistributionController {

        private final PaymentRepository paymentRepository;
        private final IDistributionService distributionService;

        @PostMapping("/{paymentId}")
        public ResponseEntity<?> distribute(
                        @PathVariable UUID paymentId) {

                Payment payment = paymentRepository
                                .findById(paymentId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Payment not found"));

                distributionService.distributePayment(payment);

                return ResponseEntity.ok(
                                "Distributed successfully");
        }
}