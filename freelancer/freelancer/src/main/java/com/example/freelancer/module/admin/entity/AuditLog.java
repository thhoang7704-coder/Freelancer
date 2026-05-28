package com.example.freelancer.module.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.User.User;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * User thực hiện action
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * PAYMENT_SUCCESS
     * PROJECT_APPROVED
     * COMPANY_REJECTED
     */
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    /**
     * PROJECT
     * PAYMENT
     * COMPANY
     */
    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    /**
     * JSON old state
     */
    @Column(name = "old_data", columnDefinition = "TEXT")
    private String oldData;

    /**
     * JSON new state
     */
    @Column(name = "new_data", columnDefinition = "TEXT")
    private String newData;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}