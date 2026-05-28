package com.example.freelancer.module.Project.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectApplicationCompanyItemResponse {

    private UUID applicationId;

    private UUID freelancerId;
    private String freelancerName;

    private String experience;
    private String programmingLanguages;
    private String portfolioLink;
    private String projectLinks;

    private ApprovalStatus status;
    private OffsetDateTime appliedAt;
}