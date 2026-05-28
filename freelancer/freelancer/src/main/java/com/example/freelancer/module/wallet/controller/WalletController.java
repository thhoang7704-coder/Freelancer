package com.example.freelancer.module.wallet.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.module.wallet.dto.WithdrawRequestDto;
import com.example.freelancer.module.wallet.service.interfaces.IWalletService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final IWalletService walletService;

    @GetMapping("/me")
    public ApiResponse<?> getMyWallet() {
        return ApiResponse.ok(walletService.getMyWallet(), "Lấy ví thành công");
    }

    @PostMapping("/withdraw")
    public ApiResponse<?> withdraw(
            @RequestBody WithdrawRequestDto request) {

        return ApiResponse.ok(
                walletService.withdraw(request),
                "Tạo yêu cầu rút tiền thành công. Vui lòng chờ xác nhận");
    }
}
