package com.example.freelancer.module.wallet.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.module.transaction.entity.Transaction;
import com.example.freelancer.module.transaction.repository.TransactionRepository;
import com.example.freelancer.module.wallet.dto.MyIncomeTransactionResponse;
import com.example.freelancer.module.wallet.dto.WithdrawHistoryResponse;
import com.example.freelancer.module.wallet.entity.Wallet;
import com.example.freelancer.module.wallet.entity.WithdrawRequest;
import com.example.freelancer.module.wallet.repository.WalletRepository;
import com.example.freelancer.module.wallet.repository.WithdrawRepository;
import com.example.freelancer.module.wallet.service.interfaces.IWalletHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletHistoryService implements IWalletHistoryService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WithdrawRepository withdrawRepository;

    @Override
    public List<MyIncomeTransactionResponse> getMyIncomeHistory() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Wallet wallet = walletRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        List<Transaction> transactions = transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());

        return transactions.stream()
                .map(transaction -> MyIncomeTransactionResponse.builder()
                        .transactionId(transaction.getId())
                        .amount(transaction.getAmount())
                        .type(transaction.getType())
                        .status(transaction.getStatus())
                        .description(transaction.getDescription())
                        .createdAt(transaction.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    public List<WithdrawHistoryResponse> getMyWithdrawHistory() {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        List<WithdrawRequest> withdraws = withdrawRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId());

        return withdraws.stream()
                .map(withdraw -> WithdrawHistoryResponse.builder()
                        .withdrawId(withdraw.getId())
                        .amount(withdraw.getAmount())
                        .bankAccount(withdraw.getBankAccount())
                        .bankName(withdraw.getBankName())
                        .accountName(withdraw.getAccountName())
                        .status(withdraw.getStatus())
                        .createdAt(withdraw.getCreatedAt())
                        .build())
                .toList();
    }
}
