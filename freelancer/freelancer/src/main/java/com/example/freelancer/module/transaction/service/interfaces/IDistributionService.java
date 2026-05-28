package com.example.freelancer.module.transaction.service.interfaces;

import com.example.freelancer.module.Payment.entity.Payment;

public interface IDistributionService {
    void distributePayment(Payment payment);
}
