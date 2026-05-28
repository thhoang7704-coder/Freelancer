package com.example.freelancer.module.Project.dto;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;

public class ProjectMapper {

    public static ProjectResponse toResponse(Project project) {

        return ProjectResponse.builder()
                .projectId(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .budget(project.getBudget())
                .deadline(project.getDeadline())
                .skillsRequired(mapSkills(project.getSkillsRequired()))
                .progressStatus(project.getProgressStatus())
                .paymentStatus(project.getPaymentStatus())
                .applyStatus(project.getApplyStatus() != null
                        ? project.getApplyStatus().name()
                        : null)
                .company(CompanyInfoResponse.builder()
                        .companyId(project.getCompany().getId())
                        .companyName(project.getCompany().getCompanyName())
                        .build())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getApprovedAt()) // hoặc field updatedAt nếu bạn có
                .status(project.getStatus())
                .build();
    }

    /**
     * Convert skills:
     * - nếu DB lưu String: "Java,React,SQL"
     * - convert sang List<String>
     */
    private static List<String> mapSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}