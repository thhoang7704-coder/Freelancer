package com.example.freelancer.module.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.module.wallet.entity.Wallet;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_ledgers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    /**
     * DEPOSIT
     * WITHDRAW
     * PROJECT_PAYMENT
     * ADMIN_REVENUE
     */
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    /**
     * + hoặc -
     */
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "balance_before", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Optional reference
     */
    @Column(name = "reference_id")
    private UUID referenceId;

    /**
     * PAYMENT
     * PROJECT
     * TRANSACTION
     */
    @Column(name = "reference_type", length = 100)
    private String referenceType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
