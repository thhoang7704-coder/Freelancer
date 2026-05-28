package com.example.freelancer.module.Project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.enums.ProjectApplyStatus;
import com.example.freelancer.module.admin.dto.AttachmentResponse;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProjectItemResponse {

    private UUID projectId;

    private String name;

    private String description;

    private BigDecimal budget;

    private ApprovalStatus status;
    private LocalDate deadline;
    private String skillsRequired;
    private ProgressStatus progressStatus;

    private PaymentStatus paymentStatus;

    private CompanyInfoResponse company;

    private ProjectApplyStatus applyStatus;

    private int appliedCount;

    private int acceptedCount;

    private OffsetDateTime createdAt;
    private List<AttachmentResponse> attachments;
}