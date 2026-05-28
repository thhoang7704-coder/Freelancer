package com.example.freelancer.User.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.UserRole;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserProfileResponse {

    private UUID id;

    private String fullName;

    private String email;

    private String phone;

    private UserRole role;

    private boolean status;

    private String avatarUrl;

    private boolean isActive;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}