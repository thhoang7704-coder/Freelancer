package com.example.freelancer.module.wallet.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.freelancer.module.wallet.entity.WithdrawRequest;

public interface WithdrawRepository extends JpaRepository<WithdrawRequest, UUID> {
    List<WithdrawRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
