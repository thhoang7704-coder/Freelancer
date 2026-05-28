package com.example.freelancer.module.wallet.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawRequestDto {

    private BigDecimal amount;
    private String bankAccount;
    private String bankName;
    private String accountName;
}
