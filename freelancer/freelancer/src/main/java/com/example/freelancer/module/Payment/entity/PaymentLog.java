package com.example.freelancer.module.Payment.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_logs")
@Getter
@Setter
public class PaymentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;
    @Column(name = "vnpay_transaction_code")
    private String vnpayTransactionCode;
    @Column(name = "status")
    private String status;
    @Column(name = "raw_response")
    @Lob
    private String rawResponse;
}
