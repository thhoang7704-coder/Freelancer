package com.example.freelancer.module.transaction.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.enums.TransactionType;
import com.example.freelancer.enums.WalletTransactionStatus;
import com.example.freelancer.module.wallet.entity.Wallet;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
    @Column(name = "amount")
    private BigDecimal amount;
    @Column(name = "transaction_type")
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private WalletTransactionStatus status;
    @Column(name = "description")
    private String description;
    @Column(name = "created_at")
    @CreationTimestamp
    private OffsetDateTime createdAt;
}
