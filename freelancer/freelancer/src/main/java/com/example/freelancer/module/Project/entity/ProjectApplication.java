package com.example.freelancer.module.Project.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.freelancer.entity.Freelancer;

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
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "project_applications")
@Getter
@Setter
public class ProjectApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ApprovalStatus status;
    @Column(name = "applied_at")
    private OffsetDateTime appliedAt;
}