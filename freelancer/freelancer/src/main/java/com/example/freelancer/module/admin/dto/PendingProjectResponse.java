package com.example.freelancer.module.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingProjectResponse {

    private UUID projectId;

    private String name;

    private BigDecimal budget;
    private String description;
    private LocalDate deadline;
    private List<String> files;

    private CompanyInfoResponse company;

    private ApprovalStatus status;

    private OffsetDateTime createdAt;
}
