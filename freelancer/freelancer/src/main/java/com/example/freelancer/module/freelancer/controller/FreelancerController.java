package com.example.freelancer.module.freelancer.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.module.Project.dto.UpdateProjectProgressRequest;
import com.example.freelancer.module.freelancer.dto.CreateFreelancerRequest;
import com.example.freelancer.module.freelancer.dto.FreelancerResponse;
import com.example.freelancer.module.freelancer.dto.TeamDetailResponse;
import com.example.freelancer.module.freelancer.dto.TeamListResponse;
import com.example.freelancer.module.freelancer.dto.UpdateFreelancerRequest;
import com.example.freelancer.module.freelancer.service.interfaces.IFreelancerService;
import com.example.freelancer.module.freelancer.service.interfaces.ITeamService;
import com.example.freelancer.module.report.dto.ReportFeedbackResponse;
import com.example.freelancer.module.report.dto.WorkReportResponse;
import com.example.freelancer.module.report.service.interfaces.IReportFeedbackService;
import com.example.freelancer.module.report.service.interfaces.IWorkReportService;
import com.example.freelancer.module.task.dto.LeaderTaskOverviewResponse;
import com.example.freelancer.module.task.service.interfaces.ITaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/freelancers")
@RequiredArgsConstructor
public class FreelancerController {

        private final IFreelancerService freelancerService;
        private final ITeamService teamService;
        private final ITaskService taskService;
        private final IWorkReportService workReportService;
        private final IReportFeedbackService reportFeedbackService;

        @PostMapping
        public ApiResponse<FreelancerResponse> createFreelancer(
                        @Valid @RequestBody CreateFreelancerRequest request) {
                FreelancerResponse response = freelancerService.createFreelancer(request);
                return ApiResponse.ok(response, "Đăng ký freelancer thành công");
        }

        @GetMapping("/{freelancerId}")
        @PreAuthorize("hasAnyRole('COMPANY','ADMIN')")
        public ApiResponse<FreelancerResponse> getFreelancerProfile(
                        @PathVariable UUID freelancerId) {

                FreelancerResponse response = freelancerService.getFreelancerProfile(
                                freelancerId);

                return ApiResponse.ok(response, "Lấy thông tin freelancer thành công");
        }

        @GetMapping("/me")
        @PreAuthorize("hasRole('FREELANCER')")
        public ApiResponse<FreelancerResponse> getMyFreelancerProfile() {

                FreelancerResponse response = freelancerService.getMyFreelancerProfile();

                return ApiResponse.ok(response, "Lấy thông tin freelancer thành công");
        }

        @GetMapping("/my-teams")
        @PreAuthorize("hasRole('FREELANCER')")
        public ApiResponse<List<TeamListResponse>> getMyTeams() {
                return ApiResponse.ok(teamService.getMyTeams(), "Lấy danh sách team thành công");
        }

        @PutMapping("/me")
        public ResponseEntity<ApiResponse<FreelancerResponse>> updateFreelancer(
                        @RequestBody UpdateFreelancerRequest request) {

                FreelancerResponse response = freelancerService.updateFreelancer(request);

                return ResponseEntity.ok(
                                ApiResponse.ok(response, "Cập nhật thông tin freelancer thành công"));
        }

        // xem chi tiêt từng team, bao gồm thông tin các thành viên trong team đó
        @GetMapping("/teams/{teamId}")
        @PreAuthorize("hasAnyRole('COMPANY','FREELANCER')")
        public ResponseEntity<?> getTeamDetail(
                        @PathVariable UUID teamId) {

                TeamDetailResponse response = teamService.getTeamDetail(teamId);

                return ResponseEntity.ok(
                                ApiResponse.ok(response, "Lấy thông tin chi tiết team thành công"));
        }

        @PutMapping("/leader/{projectId}/progress")
        @PreAuthorize("hasRole('FREELANCER')")
        public ApiResponse<?> updateProgress(
                        @PathVariable UUID projectId,
                        @RequestBody UpdateProjectProgressRequest request) {

                freelancerService.updateProjectProgress(projectId, request);

                return ApiResponse.ok(
                                null,
                                "Cập nhật tiến độ dự án thành công");
        }

        // chỉ leader mới được xem tất cả task của project, bao gồm cả task được nhận và
        // chưa được nhận
        @GetMapping("/project/{projectId}/leader-overview")
        public ResponseEntity<List<LeaderTaskOverviewResponse>> getProjectTasksForLeader(
                        @PathVariable UUID projectId) {

                return ResponseEntity.ok(
                                taskService.getProjectTasksForLeader(projectId));
        }

        @GetMapping("/my-reports")
        @PreAuthorize("hasRole('FREELANCER')")
        public ResponseEntity<List<WorkReportResponse>> getMyReports() {
                return ResponseEntity.ok(workReportService.getMyReports());
        }

        // leeder viết feedback cho báo cáo của freelancer
        @PostMapping(value = "/reports/{reportId}/leader-feedbacks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ReportFeedbackResponse> provideLeaderFeedback(
                        @PathVariable UUID reportId,
                        @RequestParam("feedback") String feedback,
                        @RequestParam(value = "file", required = false) MultipartFile file) {

                ReportFeedbackResponse response = reportFeedbackService.addLeaderFeedback(reportId, feedback, file);
                return ResponseEntity.ok(response);
        }

        // xem báo cáo hoặc feedback của báo cáo
        @GetMapping("/reports/{reportId}/feedbacks")
        public ResponseEntity<List<ReportFeedbackResponse>> getFeedbacksOfReport(
                        @PathVariable UUID reportId) {

                List<ReportFeedbackResponse> responses = reportFeedbackService.getFeedbacksOfReport(reportId);
                return ResponseEntity.ok(responses);
        }

        // sửa báo cáo đã viết
        @PutMapping(value = "/reports/{reportId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<WorkReportResponse> updateReport(
                        @PathVariable UUID reportId,
                        @RequestParam("content") String content,
                        @RequestParam(value = "file", required = false) MultipartFile file) {
                WorkReportResponse response = workReportService.updateReport(reportId, content, file);
                return ResponseEntity.ok(response);
        }
}