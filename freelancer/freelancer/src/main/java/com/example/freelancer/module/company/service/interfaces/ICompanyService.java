package com.example.freelancer.module.company.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.freelancer.module.company.dto.CompanyDetailResponse;
import com.example.freelancer.module.company.dto.CompanyPaymentResponse;
import com.example.freelancer.module.company.dto.CompanyProjectResponse;
import com.example.freelancer.module.company.dto.CompanyResponse;
import com.example.freelancer.module.company.dto.CreateCompanyRequest;
import com.example.freelancer.module.company.dto.UpdateCompanyRequest;
import com.example.freelancer.module.freelancer.dto.SetLeaderRequest;

public interface ICompanyService {

        CompanyResponse createCompany(
                        CreateCompanyRequest request);

        CompanyDetailResponse getCompanyProfile(
                        UUID companyId);

        CompanyDetailResponse getMyCompanyProfile();

        void updateMyCompany(
                        UpdateCompanyRequest request);

        void lockProject(UUID projectId);

        void unlockProject(UUID projectId);

        void setLeader(
                        UUID teamId,
                        SetLeaderRequest request);

        // xem tất cả project của công ty, bao gồm cả project đã bị khóa
        List<CompanyProjectResponse> getCompanyProjects();

        // xem payment của công ty
        List<CompanyPaymentResponse> getMyPayments();

}
