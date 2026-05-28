package com.example.freelancer.module.admin.dto;

import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateProjectStatusResponse {

    private UUID projectId;

    private ApprovalStatus status;
}