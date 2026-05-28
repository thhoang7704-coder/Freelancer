package com.example.freelancer.module.company.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CompanyDetailResponse {

    private UUID companyId;

    private UUID userId;

    private String companyName;

    private String address;

    private String taxCode;

    private String representativeName;

    private String representativePhone;
    private String expertise;

    private ApprovalStatus status;

    private UUID approvedBy;

    private OffsetDateTime approvedAt;

    private OffsetDateTime createdAt;
}
