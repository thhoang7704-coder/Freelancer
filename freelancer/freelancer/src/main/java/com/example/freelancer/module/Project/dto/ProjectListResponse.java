package com.example.freelancer.module.Project.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProjectListResponse {

    private long totalElements;

    private int totalPages;

    private int currentPage;

    private List<ProjectItemResponse> projects;
}