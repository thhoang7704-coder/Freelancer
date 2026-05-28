package com.example.freelancer.module.admin.dto;

import com.example.freelancer.enums.ApprovalStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCompanyStatusRequest {

    private ApprovalStatus status;

    private String notes;
}
