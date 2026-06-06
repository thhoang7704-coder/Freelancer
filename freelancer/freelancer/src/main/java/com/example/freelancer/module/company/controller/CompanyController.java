package com.example.freelancer.module.company.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.Project.dto.ProjectApplicationCompanyItemResponse;
import com.example.freelancer.module.Project.dto.ProjectMemberResponse;
import com.example.freelancer.module.Project.service.interfaces.IProjectApplicationService;
import com.example.freelancer.module.company.dto.CompanyDetailResponse;
import com.example.freelancer.module.company.dto.CompanyPaymentResponse;
import com.example.freelancer.module.company.dto.CompanyProjectTaskResponse;
import com.example.freelancer.module.company.dto.CompanyResponse;
import com.example.freelancer.module.company.dto.CreateCompanyRequest;
import com.example.freelancer.module.company.dto.UpdateCompanyRequest;
import com.example.freelancer.module.company.service.interfaces.ICompanyService;
import com.example.freelancer.module.freelancer.dto.AddTeamMemberRequest;
import com.example.freelancer.module.freelancer.dto.CreateTeamRequest;
import com.example.freelancer.module.freelancer.dto.SetLeaderRequest;
import com.example.freelancer.module.freelancer.dto.TeamListResponse;
import com.example.freelancer.module.freelancer.dto.TeamMemberResponse;
import com.example.freelancer.module.freelancer.dto.TeamResponse;
import com.example.freelancer.module.freelancer.service.interfaces.ITeamService;
import com.example.freelancer.module.report.dto.ReportFeedbackResponse;
import com.example.freelancer.module.report.service.interfaces.IReportFeedbackService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

        private final ICompanyService companyService;
        private final IProjectApplicationService projectApplicationService;
        private final ITeamService teamService;
        private final IReportFeedbackService reportFeedbackService;

        @PostMapping
        public ApiResponse<CompanyResponse> createCompany(
                        @RequestBody CreateCompanyRequest request) {

                CompanyResponse response = companyService.createCompany(request);

                return ApiResponse.ok(response, "Tạo hồ sơ công ty thành công. Vui lòng chờ admin duyệt");
        }

        @GetMapping("/{companyId}")
        @PreAuthorize("hasAnyRole('COMPANY','ADMIN')")
        public ResponseEntity<?> getCompanyProfile(
                        @PathVariable UUID companyId) {

                CompanyDetailResponse response = companyService.getCompanyProfile(
                                companyId);

                return ResponseEntity.ok(
                                ApiResponse.ok(response, "Lấy thông tin công ty thành công"));
        }

        @GetMapping("/me")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<?> getMyCompanyProfile() {

                CompanyDetailResponse response = companyService.getMyCompanyProfile();

                return ResponseEntity.ok(
                                ApiResponse.ok(response, "Lấy thông tin công ty thành công"));
        }

        @PutMapping("/me")
        public ResponseEntity<ApiResponse<String>> updateMyCompany(
                        @RequestBody UpdateCompanyRequest request) {

                companyService.updateMyCompany(request);

                return ResponseEntity.ok(
                                ApiResponse.ok(
                                                "Cập nhật thông tin công ty thành công"));
        }

        @GetMapping("/{projectId}/freelancer-applications")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<PageResponse<ProjectApplicationCompanyItemResponse>> getApplications(
                        @PathVariable UUID projectId,
                        @RequestParam(required = false) ApprovalStatus status,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "20") int pageSize) {
                return ResponseEntity.ok(
                                projectApplicationService.getProjectApplications(
                                                projectId, status, page, pageSize));
        }

        @PutMapping("/{projectId}/freelancer-applications/{applicationId}/status")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<?> updateApplicationStatus(
                        @PathVariable UUID projectId,
                        @PathVariable UUID applicationId,
                        @RequestBody com.example.freelancer.module.Project.dto.UpdateApplicationStatusRequest request) {

                projectApplicationService.updateApplicationStatus(
                                applicationId,
                                request);

                return ResponseEntity.ok(
                                ApiResponse.ok(
                                                "Cập nhật trạng thái ứng tuyển thành công"));
        }

        @PostMapping("/teams")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<ApiResponse<TeamResponse>> createTeam(
                        @Valid @RequestBody CreateTeamRequest request) {

                TeamResponse response = teamService.createTeam(request);

                return ResponseEntity.ok(ApiResponse.ok(response, "Tạo team thành công"));
        }

        @PostMapping("/{teamId}/members")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<?> addMemberToTeam(
                        @PathVariable UUID teamId,
                        @Valid @RequestBody AddTeamMemberRequest request) {

                teamService.addMemberToTeam(teamId, request);

                return ResponseEntity.ok(ApiResponse.ok("Thêm thành viên thành công"));
        }

        @PutMapping("/{teamId}/leader")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<?> setLeader(
                        @PathVariable UUID teamId,
                        @Valid @RequestBody SetLeaderRequest request) {

                companyService.setLeader(teamId, request);

                return ResponseEntity.ok(
                                ApiResponse.ok(
                                                "Cập nhật trưởng nhóm thành công"));
        }

        @DeleteMapping("/{teamId}/members/{memberId}")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<?> removeMember(
                        @PathVariable UUID teamId,
                        @PathVariable UUID memberId) {

                teamService.removeMember(teamId, memberId);

                return ResponseEntity.ok(
                                ApiResponse.ok(
                                                "Xóa thành viên thành công"));
        }

        @GetMapping("/teams/{teamId}/members")
        @PreAuthorize("hasRole('COMPANY')")
        public ApiResponse<List<TeamMemberResponse>> getTeamMembers(
                        @PathVariable UUID teamId) {

                return ApiResponse.ok(
                                teamService.getTeamMembers(teamId));
        }

        @GetMapping("/projects/{projectId}/members")
        @PreAuthorize("hasRole('COMPANY')")
        public ApiResponse<List<ProjectMemberResponse>> getProjectMembers(
                        @PathVariable UUID projectId) {

                return ApiResponse.ok(
                                projectApplicationService.getProjectMembers(projectId),
                                "Lấy danh sách thành viên dự án thành công");
        }

        @DeleteMapping("/projects/{projectId}/members/{memberId}")
        @PreAuthorize("hasRole('COMPANY')")
        public ApiResponse<String> removeProjectMember(
                        @PathVariable UUID projectId,
                        @PathVariable UUID memberId) {

                projectApplicationService.removeProjectMember(projectId, memberId);

                return ApiResponse.ok("Xóa thành viên khỏi dự án thành công");
        }

        @GetMapping("/company/all-projects")
        @PreAuthorize("hasRole('COMPANY')")
        public ApiResponse<?> getCompanyProjects() {

                return ApiResponse.ok(
                                companyService.getCompanyProjects(),
                                "Lấy danh sách project thành công");
        }

        @GetMapping("/my-payments")
        public ResponseEntity<List<CompanyPaymentResponse>> getMyPayments() {

                return ResponseEntity.ok(companyService.getMyPayments());
        }

        // khóa dự án
        @PutMapping("/{projectId}/lock")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<String> lockProject(
                        @PathVariable UUID projectId) {

                companyService.lockProject(projectId);

                return ResponseEntity.ok("Khóa dự án thành công");
        }

        // mở khóa dự án
        @PutMapping("/{projectId}/unlock")
        @PreAuthorize("hasRole('COMPANY')")
        public ResponseEntity<String> unlockProject(
                        @PathVariable UUID projectId) {

                companyService.unlockProject(projectId);

                return ResponseEntity.ok("Mở khóa dự án thành công");
        }

        // lấy danh sách team của công ty
        @GetMapping("/teams")
        @PreAuthorize("hasRole('COMPANY')")
        public ApiResponse<List<TeamListResponse>> getAllTeams() {

                return ApiResponse.ok(
                                teamService.getAllTeams(),
                                "Lấy danh sách team thành công");
        }

        // công ty viết feedback cho báo cáo của freelancer và leader sẽ nhận được
        @PostMapping(value = "/reports/{reportId}/company-feedbacks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ReportFeedbackResponse> provideCompanyFeedback(
                        @PathVariable UUID reportId,
                        @RequestParam("feedback") String feedback,
                        @RequestParam(value = "file", required = false) MultipartFile file) {

                ReportFeedbackResponse response = reportFeedbackService.addCompanyFeedback(reportId, feedback, file);
                return ResponseEntity.ok(response);
        }

        // công ty xem tất cả task + báo cáo + feedback của một project
        @GetMapping("/projects/{projectId}/tasks")
        @PreAuthorize("hasRole('COMPANY')")
        public ApiResponse<List<CompanyProjectTaskResponse>> getProjectTasks(
                        @PathVariable UUID projectId) {

                return ApiResponse.ok(
                                companyService.getProjectTasks(projectId),
                                "Lấy danh sách task thành công");
        }
}
