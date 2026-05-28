package com.example.freelancer.module.Project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectResponse {

    private UUID projectId;

    private String name;

    private String description;

    private BigDecimal budget;

    private LocalDate deadline;

    private List<String> skillsRequired;
    private List<String> files;
    private ProgressStatus progressStatus;

    private PaymentStatus paymentStatus;

    private String applyStatus;

    private CompanyInfoResponse company;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
    private ApprovalStatus status;
}