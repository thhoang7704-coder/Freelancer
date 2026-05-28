package com.example.freelancer.module.Payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.freelancer.module.Payment.entity.PaymentLog;

import java.util.List;
import java.util.UUID;

public interface PaymentLogRepository extends JpaRepository<PaymentLog, UUID> {

    List<PaymentLog> findByPaymentId(UUID paymentId);
}
