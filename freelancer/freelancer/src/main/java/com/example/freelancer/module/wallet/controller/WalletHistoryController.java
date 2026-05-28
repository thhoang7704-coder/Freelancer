package com.example.freelancer.module.wallet.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.module.wallet.dto.MyIncomeTransactionResponse;
import com.example.freelancer.module.wallet.dto.WithdrawHistoryResponse;
import com.example.freelancer.module.wallet.service.WalletHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/wallet-history")
@RequiredArgsConstructor
public class WalletHistoryController {

    private final WalletHistoryService walletHistoryService;

    @GetMapping("/income-history")
    public ResponseEntity<List<MyIncomeTransactionResponse>> getMyIncomeHistory() {

        return ResponseEntity.ok(
                walletHistoryService.getMyIncomeHistory());
    }

    @GetMapping("/withdraw")
    public ResponseEntity<List<WithdrawHistoryResponse>> getWithdrawHistory() {

        return ResponseEntity.ok(
                walletHistoryService.getMyWithdrawHistory());
    }
}