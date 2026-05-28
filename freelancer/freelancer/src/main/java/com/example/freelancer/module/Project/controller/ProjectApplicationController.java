package com.example.freelancer.module.Project.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.Project.dto.ApplyProjectRequest;
import com.example.freelancer.module.Project.dto.ProjectApplicationItemResponse;
import com.example.freelancer.module.Project.dto.ProjectApplicationResponse;
import com.example.freelancer.module.Project.dto.ProjectMemberResponse;
import com.example.freelancer.module.Project.dto.UpdateApplicationStatusRequest;
import com.example.freelancer.module.Project.dto.UpdateApplicationStatusResponse;
import com.example.freelancer.module.Project.service.ProjectApplicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/project-applications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class ProjectApplicationController {

    private final ProjectApplicationService projectApplicationService;

    @PostMapping
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<ProjectApplicationResponse> applyProject(
            @RequestBody ApplyProjectRequest request) {

        ProjectApplicationResponse response = projectApplicationService.applyProject(request);

        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<PageResponse<ProjectApplicationItemResponse>> getMyApplications(
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(
                projectApplicationService.getMyApplications(status, page, pageSize));
    }

    @GetMapping("/{projectId}/members")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<List<ProjectMemberResponse>> getProjectMembers(
            @PathVariable UUID projectId) {
        return ResponseEntity.ok(
                projectApplicationService.getProjectMembers(projectId));
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<UpdateApplicationStatusResponse> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request) {

        return ResponseEntity.ok(
                projectApplicationService
                        .updateApplicationStatus(
                                applicationId,
                                request));
    }
}