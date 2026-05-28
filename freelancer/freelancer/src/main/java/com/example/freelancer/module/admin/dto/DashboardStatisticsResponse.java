package com.example.freelancer.module.admin.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardStatisticsResponse {

    private long totalUsers;

    private long totalFreelancers;

    private long totalCompanies;

    private long totalProjects;

    private long approvedProjects;

    private long pendingProjects;

    private long rejectedProjects;

    private BigDecimal totalPayments;

    private BigDecimal totalRevenue;

    private List<RecentPaymentResponse> recentPayments;
}
