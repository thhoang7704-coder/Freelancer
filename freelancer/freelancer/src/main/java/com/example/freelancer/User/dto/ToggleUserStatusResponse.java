package com.example.freelancer.User.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ToggleUserStatusResponse {

    private UUID id;

    private String fullName;

    private boolean isActive;
}
