package com.example.freelancer.module.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.User.User;
import com.example.freelancer.module.Project.entity.Project;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_budget_histories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectBudgetHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /**
     * Budget cũ
     */
    @Column(name = "old_budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal oldBudget;

    /**
     * Budget mới
     */
    @Column(name = "new_budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal newBudget;

    /**
     * Company/Admin thay đổi
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    /**
     * PENDING / APPROVED / REJECTED
     */
    @Column(name = "approval_status", length = 50)
    private String approvalStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
