package com.example.freelancer.module.company.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.User.User;
import com.example.freelancer.enums.ApprovalStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "companies")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "company_name", nullable = false)
    private String companyName;
    @Column(name = "address", nullable = false)
    private String address;
    @Column(name = "tax_code", nullable = false)
    private String taxCode;
    @Column(name = "representative_name", nullable = false)
    private String representativeName;
    @Column(name = "representative_phone", nullable = false)
    private String representativePhone;
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;
    @Column(name = "approved_by")
    private UUID approvedBy;
    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
    @Column(name = "rejection_reason", nullable = true)
    private String rejectionReason;
    @Column(name = "expertise", nullable = false)
    private String expertise;
}