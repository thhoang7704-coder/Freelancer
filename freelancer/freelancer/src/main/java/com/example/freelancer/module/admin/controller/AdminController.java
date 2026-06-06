package com.example.freelancer.module.admin.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.User.dto.ToggleUserStatusResponse;
import com.example.freelancer.User.dto.UserListItemDto;
import com.example.freelancer.User.dto.UserResponse;
import com.example.freelancer.User.service.interfaces.IUserService;
import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.module.admin.dto.CompanyStatusResponse;
import com.example.freelancer.module.admin.dto.PendingCompanyResponse;
import com.example.freelancer.module.admin.dto.PendingProjectResponse;
import com.example.freelancer.module.admin.dto.PaymentResponse;
import com.example.freelancer.module.admin.dto.UpdateCompanyStatusRequest;
import com.example.freelancer.module.admin.dto.UpdateProjectStatusRequest;
import com.example.freelancer.module.admin.dto.UpdateProjectStatusResponse;
import com.example.freelancer.module.admin.service.AdminService;
import com.example.freelancer.module.notification.dto.AdminBroadcastRequest;
import com.example.freelancer.module.notification.dto.AdminSendCompanyNotificationRequest;
import com.example.freelancer.module.notification.dto.NotificationResponse;
import com.example.freelancer.module.notification.service.NotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final NotificationService notificationService;
    private final IUserService userService;

    @GetMapping("/companies/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<PendingCompanyResponse>> getPendingCompanies(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        return ApiResponse.ok(
                adminService.getPendingCompanies(page, pageSize));
    }

    @GetMapping("/projects/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<PendingProjectResponse>> getPendingProjects(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        return ApiResponse.ok(
                adminService.getPendingProjects(page, pageSize));
    }

    @PutMapping("/projects/{projectId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UpdateProjectStatusResponse> updateProjectStatus(
            @PathVariable UUID projectId,
            @Valid @RequestBody UpdateProjectStatusRequest request) {

        return ApiResponse.ok(adminService.updateProjectStatus(projectId, request),
                "Cập nhật trạng thái dự án thành công");
    }

    @PutMapping("/companies/{companyId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CompanyStatusResponse> updateCompanyStatus(
            @PathVariable UUID companyId,
            @RequestBody UpdateCompanyStatusRequest request) {

        return ApiResponse.ok(adminService.updateCompanyStatus(companyId, request),
                "Cập nhật trạng thái công ty thành công");
    }

    @GetMapping("/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getAllCompanies() {
        return ApiResponse.ok(adminService.getAllCompanies());
    }

    @GetMapping("/allprojects")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getAllProjects() {
        return ApiResponse.ok(adminService.getAllProjectsByAdmin());
    }

    // gửi thông báo cho công ty từ admin
    @PostMapping("/notification/company")
    public ResponseEntity<NotificationResponse> sendNotificationToCompany(
            @RequestBody AdminSendCompanyNotificationRequest request) {

        return ResponseEntity.ok(
                notificationService.sendNotificationToCompany(request));
    }

    @GetMapping("/all-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<UserListItemDto>> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        return ApiResponse.ok(userService.getAllUsers(page, limit));
    }

    @GetMapping("/{id}/user-details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @PathVariable UUID id) {

        UserResponse response = userService.getUserById(id);

        return ResponseEntity.ok(
                ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ToggleUserStatusResponse>> toggleUserStatus(
            @PathVariable UUID id) {

        ToggleUserStatusResponse response = userService.toggleUserStatus(id);

        return ResponseEntity.ok(
                ApiResponse.ok(response));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.ok(adminService.getAllPayments());
    }

    @PostMapping("/admin/notifications/broadcast")
    public ResponseEntity<?> broadcastToAdmins(@RequestBody AdminBroadcastRequest req) {
        // kiểm tra quyền có thể đã có sẵn trong controller
        notificationService.sendToAllAdminsAsync(req.getTitle(), req.getContent());
        return ResponseEntity.accepted().body(Map.of("message", "Broadcast queued"));
    }
}
