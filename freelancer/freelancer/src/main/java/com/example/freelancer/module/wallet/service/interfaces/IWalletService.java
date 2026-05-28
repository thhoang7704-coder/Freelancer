package com.example.freelancer.module.wallet.service.interfaces;

import java.math.BigDecimal;
import java.util.UUID;

import com.example.freelancer.module.wallet.dto.WalletResponse;
import com.example.freelancer.module.wallet.dto.WithdrawRequestDto;
import com.example.freelancer.module.wallet.entity.Wallet;
import com.example.freelancer.module.wallet.entity.WithdrawResponse;

public interface IWalletService {
    WalletResponse getMyWallet();

    WithdrawResponse withdraw(WithdrawRequestDto request);

    void credit(
            UUID userId,
            BigDecimal amount,
            String description);

    void debit(
            UUID userId,
            BigDecimal amount,
            String description);

    Wallet getOrCreateWallet(UUID userId);
}
