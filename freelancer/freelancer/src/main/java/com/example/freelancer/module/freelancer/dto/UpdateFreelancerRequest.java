package com.example.freelancer.module.freelancer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateFreelancerRequest {

    private String experience;

    private String projectLinks;

    private String programmingLanguages;

    private String certificates;

    private String portfolioLink;

    private String avatarUrl;
}
