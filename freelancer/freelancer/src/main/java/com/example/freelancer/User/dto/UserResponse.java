package com.example.freelancer.User.dto;

import java.util.UUID;

import com.example.freelancer.enums.UserRole;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {
    private UUID id;

    private String fullName;

    private String email;

    private String phone;

    private UserRole role;
    private String avatarUrl;

}
