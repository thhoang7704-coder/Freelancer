package com.example.freelancer.module.freelancer.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamResponse {
    private UUID teamId;

    private UUID projectId;

    private String name;

    private List<TeamMemberResponse> members;

    private OffsetDateTime createdAt;
}
