package com.example.freelancer.module.Payment.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponse {

    private UUID paymentId;

    private UUID projectId;

    private BigDecimal totalAmount;

    private PaymentStatus status;

    private String vnpayUrl;

    private String paymentCode;

    private OffsetDateTime createdAt;

    private String message;
}
