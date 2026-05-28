package com.example.freelancer.User.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateProfileResponse {

    private UUID id;

    private String fullName;

    private String email;

    private String phone;

    private String avatarUrl;

    private OffsetDateTime updatedAt;
}