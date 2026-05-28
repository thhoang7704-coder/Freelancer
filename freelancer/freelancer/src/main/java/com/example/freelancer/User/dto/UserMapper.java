package com.example.freelancer.User.dto;

import org.springframework.stereotype.Component;

import com.example.freelancer.User.User;

@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(User user) {

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.isStatus())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UpdateProfileResponse toUpdateProfileResponse(User user) {

        return UpdateProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
