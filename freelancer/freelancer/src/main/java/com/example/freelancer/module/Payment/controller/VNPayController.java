package com.example.freelancer.module.Payment.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.module.Payment.service.IPaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/vnpay")
@RequiredArgsConstructor
public class VNPayController {

    private final IPaymentService paymentService;

    @GetMapping("/return")
    public ResponseEntity<?> vnpayReturn(
            @RequestParam Map<String, String> params) {

        paymentService.handleVnpayReturn(params);

        return ResponseEntity.ok(
                "Payment processed");
    }
}
