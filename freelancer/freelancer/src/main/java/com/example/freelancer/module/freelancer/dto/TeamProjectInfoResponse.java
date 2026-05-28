package com.example.freelancer.module.freelancer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.enums.ProgressStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamProjectInfoResponse {

    private UUID projectId;

    private String projectName;

    private BigDecimal budget;

    private LocalDate deadline;

    private ApprovalStatus status;

    private ProgressStatus progressStatus;

    private PaymentStatus paymentStatus;
}