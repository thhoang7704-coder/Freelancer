package com.example.freelancer.module.company.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.enums.ProjectApplyStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyProjectResponse {

    private UUID projectId;

    private String projectName;

    private String description;

    private ProgressStatus progressStatus;

    private int totalTasks;

    private int doneTasks;

    private int inProgressTasks;
    private int appliedCount;

    private int acceptedCount;

    private int todoTasks;
    private BigDecimal budget;

    private ApprovalStatus status;

    private LocalDate deadline;

    private List<String> skillsRequired;

    private ProjectApplyStatus applyStatus;
    private OffsetDateTime createdAt;
}