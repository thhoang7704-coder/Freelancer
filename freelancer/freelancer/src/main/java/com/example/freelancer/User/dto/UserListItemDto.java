package com.example.freelancer.User.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.UserRole;

@Getter
@Builder
public class UserListItemDto {

    private UUID id;

    private String fullName;

    private String email;

    private String phone;

    private UserRole role;
    private boolean isActive;
    private OffsetDateTime createdAt;
}
