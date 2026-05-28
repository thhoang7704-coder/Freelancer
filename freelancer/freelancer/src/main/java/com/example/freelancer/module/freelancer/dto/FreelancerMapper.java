package com.example.freelancer.module.freelancer.dto;

import org.springframework.stereotype.Component;

import com.example.freelancer.module.freelancer.entity.Freelancer;

@Component
public class FreelancerMapper {

    public FreelancerResponse toResponse(Freelancer freelancer) {

        return FreelancerResponse.builder()
                .id(freelancer.getId())
                .userId(freelancer.getUser().getId())
                .fullName(freelancer.getUser().getFullName())
                .phone(freelancer.getUser().getPhone())
                .experience(freelancer.getExperience())
                .projectLinks(freelancer.getProjectLinks())
                .programmingLanguages(freelancer.getProgrammingLanguages())
                .certificates(freelancer.getCertificates())
                .portfolioLink(freelancer.getPortfolioLink())
                .avatarUrl(freelancer.getAvatarUrl())
                .createdAt(freelancer.getCreatedAt())
                .build();
    }
}