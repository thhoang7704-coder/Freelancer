package com.example.freelancer.User.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.freelancer.User.dto.ChangePasswordRequest;
import com.example.freelancer.User.dto.ToggleUserStatusResponse;
import com.example.freelancer.User.dto.UpdateProfileRequest;
import com.example.freelancer.User.dto.UpdateProfileResponse;
import com.example.freelancer.User.dto.UserListItemDto;
import com.example.freelancer.User.dto.UserProfileResponse;
import com.example.freelancer.User.dto.UserResponse;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.module.notification.dto.NotificationResponse;

public interface IUserService {
    UserProfileResponse getMyProfile();

    UpdateProfileResponse updateMyProfile(UpdateProfileRequest request);

    void changePassword(ChangePasswordRequest request);

    List<NotificationResponse> getMyNotifications();

    void markAsRead(UUID notificationId);

    PageResponse<UserListItemDto> getAllUsers(
            int page,
            int limit);

    UserResponse getUserById(UUID id);

    ToggleUserStatusResponse toggleUserStatus(UUID userId);
}
