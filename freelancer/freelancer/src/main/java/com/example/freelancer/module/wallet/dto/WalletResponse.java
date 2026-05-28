package com.example.freelancer.module.wallet.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WalletResponse {

    private UUID id;
    private UUID userId;
    private BigDecimal balance;
    private OffsetDateTime updatedAt;
}