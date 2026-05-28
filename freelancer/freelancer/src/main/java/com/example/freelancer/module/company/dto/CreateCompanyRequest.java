package com.example.freelancer.module.company.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCompanyRequest {

    private String companyName;

    private String address;

    private String taxCode;

    private String representativeName;

    private String representativePhone;
    private String expertise;
}
