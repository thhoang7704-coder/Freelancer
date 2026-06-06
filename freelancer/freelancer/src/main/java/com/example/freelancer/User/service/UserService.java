package com.example.freelancer.User.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.User.dto.ChangePasswordRequest;
import com.example.freelancer.User.dto.ToggleUserStatusResponse;
import com.example.freelancer.User.dto.UpdateProfileRequest;
import com.example.freelancer.User.dto.UpdateProfileResponse;
import com.example.freelancer.User.dto.UserListItemDto;
import com.example.freelancer.User.dto.UserMapper;
import com.example.freelancer.User.dto.UserProfileResponse;
import com.example.freelancer.User.dto.UserResponse;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.User.service.interfaces.IUserService;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.common.response.PageResponseUtil;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.module.notification.dto.NotificationResponse;
import com.example.freelancer.module.notification.enitity.Notification;
import com.example.freelancer.module.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final NotificationRepository notificationRepository;

    @Override
    public UserProfileResponse getMyProfile() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "User not found"));

        return userMapper.toProfileResponse(user);
    }

    @Override
    public UpdateProfileResponse updateMyProfile(
            UpdateProfileRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);

        return userMapper.toUpdateProfileResponse(user);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "User not found"));

        boolean isMatch = passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPasswordHash());

        if (!isMatch) {
            throw new BadRequestException(
                    "400", "Mật khẩu hiện tại không chính xác");
        }

        String encodedPassword = passwordEncoder.encode(
                request.getNewPassword());

        user.setPasswordHash(encodedPassword);

        userRepository.save(user);
    }

    @Override
    public List<NotificationResponse> getMyNotifications() {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        if (currentUser == null) {
            throw new AuthenticationCredentialsNotFoundException("User not authenticated");
        }

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(notification -> NotificationResponse.builder()
                        .id(notification.getId())
                        .title(notification.getTitle())
                        .content(notification.getContent())
                        .type(notification.getType())
                        .isRead(notification.isRead())
                        .referenceId(notification.getReferenceId())
                        .createdAt(notification.getCreatedAt())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow();

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Forbidden");
        }

        notification.setRead(true);
    }

    @Override
    public PageResponse<UserListItemDto> getAllUsers(
            int page,
            int limit) {

        Pageable pageable = PageRequest.of(
                page - 1,
                limit,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> users = userRepository.findAll(pageable);

        Page<UserListItemDto> dtoPage = users.map(this::mapToDto);

        return PageResponseUtil.from(dtoPage);
    }

    private UserListItemDto mapToDto(User user) {

        return UserListItemDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public UserResponse getUserById(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    public ToggleUserStatusResponse toggleUserStatus(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Không cho khóa ADMIN
        if (user.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Cannot block admin account");
        }

        // đảo trạng thái
        user.setActive(!user.isActive());

        User savedUser = userRepository.save(user);

        return ToggleUserStatusResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .isActive(savedUser.isActive())
                .build();
    }
}
