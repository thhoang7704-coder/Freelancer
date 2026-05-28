package com.example.freelancer.module.wallet.service.interfaces;

import java.util.List;

import com.example.freelancer.module.wallet.dto.MyIncomeTransactionResponse;
import com.example.freelancer.module.wallet.dto.WithdrawHistoryResponse;

public interface IWalletHistoryService {
    List<MyIncomeTransactionResponse> getMyIncomeHistory();

    List<WithdrawHistoryResponse> getMyWithdrawHistory();
}
