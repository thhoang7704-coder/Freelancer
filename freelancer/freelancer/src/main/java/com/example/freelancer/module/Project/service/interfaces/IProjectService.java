package com.example.freelancer.module.Project.service.interfaces;

import java.util.UUID;

import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.module.Project.dto.CreateProjectRequest;
import com.example.freelancer.module.Project.dto.ProjectItemResponse;
import com.example.freelancer.module.Project.dto.ProjectResponse;
import com.example.freelancer.module.Project.dto.UpdateProjectRequest;

public interface IProjectService {
        ProjectResponse createProject(
                        CreateProjectRequest request);

        PageResponse<ProjectItemResponse> getAllProjects(
                        ApprovalStatus status,
                        ProgressStatus progressStatus,
                        String search,
                        int page,
                        int pageSize);

        ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request);

        void deleteProject(UUID projectId);

}
