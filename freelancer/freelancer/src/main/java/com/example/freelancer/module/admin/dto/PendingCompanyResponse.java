package com.example.freelancer.module.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PendingCompanyResponse {

    private UUID companyId;

    private String companyName;

    private String taxCode;

    private String representativeName;

    private String representativePhone;

    private ApprovalStatus status;

    private OffsetDateTime createdAt;
}