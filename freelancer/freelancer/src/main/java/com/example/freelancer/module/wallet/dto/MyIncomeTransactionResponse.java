package com.example.freelancer.module.wallet.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TransactionType;
import com.example.freelancer.enums.WalletTransactionStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyIncomeTransactionResponse {

    private UUID transactionId;

    private BigDecimal amount;

    private TransactionType type;

    private WalletTransactionStatus status;

    private String description;

    private OffsetDateTime createdAt;
}
