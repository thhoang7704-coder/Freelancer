package com.example.freelancer.module.Payment.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.transaction.entity.PaymentTransaction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(unique = true)
    private String paymentCode;
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    @OneToOne(mappedBy = "payment", cascade = CascadeType.ALL)
    private PaymentTransaction transaction;
    @Column(name = "txn_ref")
    private String txnRef;
    // snapshot
    @Column(name = "admin_percent", precision = 5, scale = 2)
    private BigDecimal adminPercent;

    @Column(name = "leader_percent", precision = 5, scale = 2)
    private BigDecimal leaderPercent;
}