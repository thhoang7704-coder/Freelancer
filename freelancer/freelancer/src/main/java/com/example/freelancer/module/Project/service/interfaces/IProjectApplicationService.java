package com.example.freelancer.module.Project.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.Project.dto.ApplyProjectRequest;
import com.example.freelancer.module.Project.dto.ProjectApplicationCompanyItemResponse;
import com.example.freelancer.module.Project.dto.ProjectApplicationItemResponse;
import com.example.freelancer.module.Project.dto.ProjectApplicationResponse;
import com.example.freelancer.module.Project.dto.ProjectMemberResponse;
import com.example.freelancer.module.Project.dto.UpdateApplicationStatusRequest;
import com.example.freelancer.module.Project.dto.UpdateApplicationStatusResponse;

public interface IProjectApplicationService {
        ProjectApplicationResponse applyProject(ApplyProjectRequest request);

        PageResponse<ProjectApplicationItemResponse> getMyApplications(
                        ApprovalStatus status,
                        int page,
                        int pageSize);

        PageResponse<ProjectApplicationCompanyItemResponse> getProjectApplications(
                        UUID projectId,
                        ApprovalStatus status,
                        int page,
                        int pageSize);

        UpdateApplicationStatusResponse updateApplicationStatus(
                        UUID applicationId,
                        UpdateApplicationStatusRequest request);

        List<ProjectMemberResponse> getProjectMembers(UUID projectId);

        void removeProjectMember(UUID projectId, UUID memberId);
}
