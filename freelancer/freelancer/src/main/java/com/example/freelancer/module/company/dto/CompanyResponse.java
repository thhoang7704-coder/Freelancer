package com.example.freelancer.module.company.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyResponse {

    private UUID companyId;

    private String companyName;

    private ApprovalStatus status;
    private String taxCode;
    private OffsetDateTime createdAt;
    private String expertise;
    private Long totalProjects;
}
