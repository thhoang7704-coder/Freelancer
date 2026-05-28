package com.example.freelancer.module.company.dto;

import org.springframework.stereotype.Component;

import com.example.freelancer.module.company.entity.Company;

@Component
public class CompanyMapper {

        public CompanyResponse toResponse(Company company) {

                return CompanyResponse.builder()
                                .companyId(company.getId())
                                .companyName(company.getCompanyName())
                                .expertise(company.getExpertise())
                                .status(company.getStatus())
                                .build();
        }

        public CompanyDetailResponse toDetailResponse(
                        Company company) {

                return CompanyDetailResponse.builder()
                                .companyId(company.getId())
                                .userId(company.getUser().getId())
                                .companyName(company.getCompanyName())
                                .address(company.getAddress())
                                .taxCode(company.getTaxCode())
                                .expertise(company.getExpertise())
                                .representativeName(
                                                company.getRepresentativeName())
                                .representativePhone(
                                                company.getRepresentativePhone())
                                .status(company.getStatus())
                                .approvedBy(company.getApprovedBy())
                                .approvedAt(company.getApprovedAt())
                                .createdAt(company.getCreatedAt())
                                .build();
        }
}
