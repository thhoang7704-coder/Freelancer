package com.example.freelancer.module.freelancer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FreelancerResponse {

    private UUID id;

    private UUID userId;

    private String fullName;

    private String phone;

    private String experience;

    private String projectLinks;

    private String programmingLanguages;

    private String certificates;

    private String portfolioLink;

    private String avatarUrl;

    private OffsetDateTime createdAt;
}