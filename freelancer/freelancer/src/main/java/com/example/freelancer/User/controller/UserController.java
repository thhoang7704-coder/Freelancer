package com.example.freelancer.User.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.User.dto.UpdateProfileRequest;
import com.example.freelancer.User.dto.UpdateProfileResponse;
import com.example.freelancer.User.dto.UserProfileResponse;
import com.example.freelancer.User.service.UserService;
import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.module.notification.dto.NotificationResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        UserProfileResponse response = userService.getMyProfile();
        return ApiResponse.ok(response, "Get profile successfully");
    }

    @PutMapping("/me")
    public ApiResponse<UpdateProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        UpdateProfileResponse response = userService.updateMyProfile(request);

        return ApiResponse.ok(response, "Cập nhật thành công");
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {

        return ResponseEntity.ok(
                userService.getMyNotifications());
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ApiResponse<String> markNotificationAsRead(
            @PathVariable UUID notificationId) {

        userService.markAsRead(notificationId);

        return ApiResponse.ok("Đã đánh dấu thông báo là đã đọc");
    }

}
