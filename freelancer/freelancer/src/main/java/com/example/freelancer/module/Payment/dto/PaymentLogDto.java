package com.example.freelancer.module.Payment.dto;

import com.example.freelancer.enums.PaymentGatewayStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentLogDto {
    private String vnpayTransactionCode;
    private PaymentGatewayStatus status;
    private String rawResponse;
}
