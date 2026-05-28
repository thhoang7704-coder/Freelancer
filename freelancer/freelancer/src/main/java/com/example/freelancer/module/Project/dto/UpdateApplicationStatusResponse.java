package com.example.freelancer.module.Project.dto;

import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateApplicationStatusResponse {

    private UUID applicationId;

    private ApprovalStatus status;
}