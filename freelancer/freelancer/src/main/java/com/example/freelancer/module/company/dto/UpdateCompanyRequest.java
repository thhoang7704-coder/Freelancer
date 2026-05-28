package com.example.freelancer.module.company.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCompanyRequest {

    private String companyName;

    private String address;

    private String representativeName;

    private String representativePhone;
    private String expertise;
}
