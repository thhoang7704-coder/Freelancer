package com.example.freelancer.module.Payment.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.Payment.entity.PaymentRule;

@Repository
public interface PaymentRuleRepository
        extends JpaRepository<PaymentRule, UUID> {

    Optional<PaymentRule> findByActiveTrue();

    @Query("SELECT p FROM PaymentRule p WHERE p.active = true")
    Optional<PaymentRule> findActiveRule();
}