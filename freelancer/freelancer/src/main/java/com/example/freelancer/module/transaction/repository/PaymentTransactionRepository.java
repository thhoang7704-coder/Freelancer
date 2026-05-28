package com.example.freelancer.module.transaction.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.transaction.entity.PaymentTransaction;

@Repository
public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByVnpayTransactionCode(String code);
}
