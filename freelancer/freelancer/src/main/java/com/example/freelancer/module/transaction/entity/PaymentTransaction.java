package com.example.freelancer.module.transaction.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.enums.PaymentGatewayStatus;
import com.example.freelancer.module.Payment.entity.Payment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "vnpay_transaction_code")
    private String vnpayTransactionCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PaymentGatewayStatus status;

    @Column(name = "response_code")
    private String responseCode;

    @Column(name = "bank_code")
    private String bankCode;

    @Lob
    @Column(name = "raw_response")
    private String rawResponse;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}