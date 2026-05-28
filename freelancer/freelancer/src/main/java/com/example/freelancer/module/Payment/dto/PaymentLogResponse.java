package com.example.freelancer.module.Payment.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentLogResponse {

    private String vnpayTransactionCode;
    private String status;
    private String rawResponse;
}