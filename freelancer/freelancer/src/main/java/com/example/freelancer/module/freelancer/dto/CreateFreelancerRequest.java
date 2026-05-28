package com.example.freelancer.module.freelancer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateFreelancerRequest {

    @NotBlank
    private String experience;

    private String projectLinks;

    private String programmingLanguages;

    private String certificates;

    private String portfolioLink;

    private String avatarUrl;
}