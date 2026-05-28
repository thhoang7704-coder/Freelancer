package com.example.freelancer.module.Payment.entity;

import java.math.BigDecimal;
import java.util.UUID;

import com.example.freelancer.module.freelancer.entity.Freelancer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_distributions")
@Getter
@Setter
public class PaymentDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;
    @Column(name = "amount")
    private BigDecimal amount;
    @Column(name = "is_leader")
    private boolean isLeader;
}