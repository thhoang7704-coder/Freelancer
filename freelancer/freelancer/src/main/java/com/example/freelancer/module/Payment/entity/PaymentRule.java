package com.example.freelancer.module.Payment.entity;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_rules")
@Getter
@Setter
public class PaymentRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_percent")
    private BigDecimal adminPercent;

    @Column(name = "leader_percent")
    private BigDecimal leaderPercent;

    @Column(name = "freelancer_percent")
    private BigDecimal freelancerPercent;

    private boolean active;
}