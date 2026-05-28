package com.example.freelancer.module.wallet.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.TransactionType;
import com.example.freelancer.enums.WalletTransactionStatus;
import com.example.freelancer.module.transaction.entity.Transaction;
import com.example.freelancer.module.transaction.repository.TransactionRepository;
import com.example.freelancer.module.wallet.dto.WalletResponse;
import com.example.freelancer.module.wallet.dto.WithdrawRequestDto;
import com.example.freelancer.module.wallet.entity.Wallet;
import com.example.freelancer.module.wallet.entity.WithdrawRequest;
import com.example.freelancer.module.wallet.entity.WithdrawResponse;
import com.example.freelancer.module.wallet.entity.WithdrawStatus;
import com.example.freelancer.module.wallet.repository.WalletRepository;
import com.example.freelancer.module.wallet.repository.WithdrawRepository;
import com.example.freelancer.module.wallet.service.interfaces.IWalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletService implements IWalletService {

        private final WalletRepository walletRepository;
        private final WithdrawRepository withdrawRepository;
        private final TransactionRepository transactionRepository;

        @Override
        public WalletResponse getMyWallet() {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Wallet wallet = walletRepository.findByUserId(currentUser.getId())
                                .orElseGet(() -> {
                                        Wallet newWallet = Wallet.builder()
                                                        .user(User.builder().id(currentUser.getId()).build())
                                                        .balance(BigDecimal.ZERO)
                                                        .build();

                                        return walletRepository.save(newWallet);
                                });

                return WalletResponse.builder()
                                .walletId(wallet.getId())
                                .userId(wallet.getUser().getId())
                                .balance(wallet.getBalance())
                                .updatedAt(wallet.getUpdatedAt())
                                .build();
        }

        // rút tiền, tạm thời rút thành công luôn
        @Override
        @Transactional
        public WithdrawResponse withdraw(WithdrawRequestDto request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Wallet wallet = walletRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Wallet not found"));

                // MINIMUM CHECK
                if (request.getAmount().compareTo(new BigDecimal("100000")) < 0) {
                        throw new BadRequestException(
                                        "400",
                                        "Minimum withdraw is 100,000 VND");
                }

                // CHECK BALANCE
                if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
                        throw new BadRequestException(
                                        "400",
                                        "Số dư không đủ");
                }

                // TRỪ TIỀN NGAY
                wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
                walletRepository.save(wallet);

                // TẠO RECORD SUCCESS LUÔN
                WithdrawRequest withdraw = WithdrawRequest.builder()
                                .user(wallet.getUser())
                                .amount(request.getAmount())
                                .bankAccount(request.getBankAccount())
                                .bankName(request.getBankName())
                                .accountName(request.getAccountName())
                                .status(WithdrawStatus.SUCCESS)
                                .build();

                withdrawRepository.save(withdraw);

                return WithdrawResponse.builder()
                                .withdrawId(withdraw.getId())
                                .amount(withdraw.getAmount())
                                .status(withdraw.getStatus())
                                .createdAt(withdraw.getCreatedAt())
                                .build();
        }

        @Transactional
        @Override
        public void credit(
                        UUID userId,
                        BigDecimal amount,
                        String description) {

                Wallet wallet = getOrCreateWallet(userId);

                wallet.setBalance(
                                wallet.getBalance().add(amount));

                walletRepository.save(wallet);

                Transaction transaction = Transaction.builder()
                                .wallet(wallet)
                                .amount(amount)
                                .type(TransactionType.CREDIT)
                                .status(WalletTransactionStatus.SUCCESS)
                                .description(description)
                                .build();

                transactionRepository.save(transaction);
        }

        @Transactional
        @Override
        public void debit(
                        UUID userId,
                        BigDecimal amount,
                        String description) {

                Wallet wallet = getOrCreateWallet(userId);

                if (wallet.getBalance().compareTo(amount) < 0) {
                        throw new BadRequestException("404",
                                        "Số dư không đủ");
                }

                wallet.setBalance(
                                wallet.getBalance().subtract(amount));

                walletRepository.save(wallet);

                Transaction transaction = Transaction.builder()
                                .wallet(wallet)
                                .amount(amount)
                                .type(TransactionType.DEBIT)
                                .status(WalletTransactionStatus.SUCCESS)
                                .description(description)
                                .build();

                transactionRepository.save(transaction);
        }

        @Override
        public Wallet getOrCreateWallet(UUID userId) {

                return walletRepository.findByUserId(userId)
                                .orElseGet(() -> {

                                        Wallet wallet = Wallet.builder()
                                                        .user(User.builder()
                                                                        .id(userId)
                                                                        .build())
                                                        .balance(BigDecimal.ZERO)
                                                        .build();

                                        return walletRepository.save(wallet);
                                });
        }
}
