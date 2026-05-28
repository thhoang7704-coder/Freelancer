package com.example.freelancer.module.Project.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectApplicationResponse {

    private UUID applicationId;

    private UUID projectId;

    private UUID freelancerId;

    private ApprovalStatus status;

    private OffsetDateTime appliedAt;
    private String coverLetter;
}