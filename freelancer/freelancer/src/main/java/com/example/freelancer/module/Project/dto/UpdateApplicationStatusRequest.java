package com.example.freelancer.module.Project.dto;

import com.example.freelancer.enums.ApprovalStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusRequest {

    @NotNull(message = "Status is required")
    private ApprovalStatus status;
}
