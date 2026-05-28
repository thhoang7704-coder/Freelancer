package com.example.freelancer.module.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.freelancer.User.User;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Chỉ user có role ADMIN mới có profile này
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "position", length = 100)
    private String position;

    /**
     * Permission flags
     */
    @Column(name = "can_manage_users", nullable = false)
    @Builder.Default
    private Boolean canManageUsers = false;

    @Column(name = "can_manage_projects", nullable = false)
    @Builder.Default
    private Boolean canManageProjects = false;

    @Column(name = "can_manage_payments", nullable = false)
    @Builder.Default
    private Boolean canManagePayments = false;

    @Column(name = "can_manage_companies", nullable = false)
    @Builder.Default
    private Boolean canManageCompanies = false;

    @Column(name = "can_view_logs", nullable = false)
    @Builder.Default
    private Boolean canViewLogs = true;

    @Column(name = "is_super_admin", nullable = false)
    @Builder.Default
    private Boolean isSuperAdmin = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}