package com.example.freelancer.module.Project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.enums.ProjectApplyStatus;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectApplicationItemResponse {

    private UUID applicationId;

    private UUID projectId;

    private String projectName;

    private String projectDescription;

    private ProjectApplyStatus projectStatus;

    private BigDecimal budget;

    private CompanyInfoResponse company;

    private ApprovalStatus status;

    private ProgressStatus progressStatus;

    private LocalDate deadline;

    private OffsetDateTime appliedAt;
}