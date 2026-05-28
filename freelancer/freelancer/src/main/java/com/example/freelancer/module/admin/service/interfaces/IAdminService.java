package com.example.freelancer.module.admin.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.module.Project.dto.ProjectItemResponse;
import com.example.freelancer.module.admin.dto.CompanyStatusResponse;
import com.example.freelancer.module.admin.dto.PaymentResponse;
import com.example.freelancer.module.admin.dto.PendingCompanyResponse;
import com.example.freelancer.module.admin.dto.PendingProjectResponse;
import com.example.freelancer.module.admin.dto.UpdateCompanyStatusRequest;
import com.example.freelancer.module.admin.dto.UpdateProjectStatusRequest;
import com.example.freelancer.module.admin.dto.UpdateProjectStatusResponse;
import com.example.freelancer.module.company.dto.CompanyResponse;

public interface IAdminService {
        PageResponse<PendingCompanyResponse> getPendingCompanies(
                        int page,
                        int pageSize);

        // duyệt hoặc từ chối công ty, chỉ admin mới được duyệt hoặc từ chối
        CompanyStatusResponse updateCompanyStatus(
                        UUID companyId,
                        UpdateCompanyStatusRequest request);

        PageResponse<PendingProjectResponse> getPendingProjects(
                        int page,
                        int pageSize);

        // duyệt hoặc từ chối project, chỉ admin mới được duyệt hoặc từ chối
        UpdateProjectStatusResponse updateProjectStatus(
                        UUID projectId,
                        UpdateProjectStatusRequest request);

        // DashboardStatisticsResponse getDashboardStatistics();
        List<CompanyResponse> getAllCompanies();

        List<ProjectItemResponse> getAllProjectsByAdmin();

        List<PaymentResponse> getAllPayments();
}
