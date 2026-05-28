package com.example.freelancer.module.Payment.service;

import java.util.Map;

import com.example.freelancer.module.Payment.entity.Payment;

public interface IVNPayService {
    String createPaymentUrl(Payment payment);

    boolean verify(Map<String, String> params);
}
