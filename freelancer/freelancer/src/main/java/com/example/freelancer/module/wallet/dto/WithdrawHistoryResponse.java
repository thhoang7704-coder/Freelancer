package com.example.freelancer.module.wallet.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.module.wallet.entity.WithdrawStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WithdrawHistoryResponse {

    private UUID withdrawId;

    private BigDecimal amount;

    private String bankAccount;

    private String bankName;

    private String accountName;

    private WithdrawStatus status;

    private OffsetDateTime createdAt;
}