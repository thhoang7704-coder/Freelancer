package com.example.freelancer.module.transaction.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.freelancer.module.transaction.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);
}
