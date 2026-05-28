package com.example.freelancer.module.Project.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.module.Project.dto.CreateProjectRequest;
import com.example.freelancer.module.Project.dto.ProjectItemResponse;
import com.example.freelancer.module.Project.dto.ProjectResponse;
import com.example.freelancer.module.Project.dto.UpdateProjectRequest;
import com.example.freelancer.module.Project.service.interfaces.IProjectService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProjectController {

        private final IProjectService projectService;

        @PreAuthorize("hasRole('COMPANY')")
        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
                        @ModelAttribute CreateProjectRequest request) {

                ProjectResponse response = projectService.createProject(request);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.ok(
                                                response,
                                                "Tạo dự án thành công. Vui lòng chờ admin duyệt"));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<PageResponse<ProjectItemResponse>>> getAllProjects(
                        @RequestParam(required = false) ApprovalStatus status,
                        @RequestParam(required = false) ProgressStatus progressStatus,
                        @RequestParam(required = false) String search,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "20") int pageSize) {

                return ResponseEntity.ok(
                                ApiResponse.ok(
                                                projectService.getAllProjects(
                                                                status,
                                                                progressStatus,
                                                                search,
                                                                page,
                                                                pageSize)));
        }

        @PutMapping("/{projectId}")
        public ResponseEntity<?> updateProject(
                        @PathVariable UUID projectId,
                        @RequestBody UpdateProjectRequest request) {

                ProjectResponse response = projectService.updateProject(projectId, request);

                return ResponseEntity.ok(
                                ApiResponse.ok(response, "Cập nhật dự án thành công"));
        }

        @PreAuthorize("hasRole('COMPANY')")
        @DeleteMapping("/{projectId}")
        public ResponseEntity<?> deleteProject(@PathVariable UUID projectId) {

                projectService.deleteProject(projectId);

                return ResponseEntity.ok(
                                ApiResponse.ok(
                                                Map.of("status", "success", "message", "Xóa dự án thành công")));
        }
}