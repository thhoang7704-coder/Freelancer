package com.example.freelancer.module.transaction.dto;

import com.example.freelancer.enums.PaymentGatewayStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentTransactionResponse {

    private String vnpayTransactionCode;
    private PaymentGatewayStatus status;
    private String responseCode;
    private String bankCode;
}
