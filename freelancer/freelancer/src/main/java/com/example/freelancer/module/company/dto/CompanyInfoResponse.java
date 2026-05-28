package com.example.freelancer.module.company.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyInfoResponse {

    private UUID companyId;

    private String companyName;
}
