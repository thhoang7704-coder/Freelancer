package com.example.freelancer.module.Payment.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.module.Payment.dto.PaymentDetailResponse;
import com.example.freelancer.module.Payment.dto.PaymentInitiateResponse;
import com.example.freelancer.module.Payment.service.IPaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping("/project/{projectId}/initiate")
    public ResponseEntity<?> initiatePayment(
            @PathVariable UUID projectId) {

        PaymentInitiateResponse response = paymentService.initiatePayment(projectId);

        return ResponseEntity.ok(response);
    }

    // payment detail
    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentDetailResponse>> getPaymentDetail(
            @PathVariable UUID paymentId) {

        PaymentDetailResponse response = paymentService.getPaymentDetail(paymentId);

        return ResponseEntity.ok(
                ApiResponse.ok(response, "thanh cong"));
    }
}
