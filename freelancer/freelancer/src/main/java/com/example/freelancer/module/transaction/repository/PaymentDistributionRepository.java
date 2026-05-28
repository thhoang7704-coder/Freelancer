package com.example.freelancer.module.transaction.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.Payment.entity.PaymentDistribution;

@Repository
public interface PaymentDistributionRepository extends JpaRepository<PaymentDistribution, UUID> {
        List<PaymentDistribution> findByPaymentId(UUID paymentId);

}
