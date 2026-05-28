package com.example.freelancer.module.wallet.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WithdrawResponse {

    private UUID withdrawId;
    private BigDecimal amount;
    private WithdrawStatus status;
    private OffsetDateTime createdAt;
}
