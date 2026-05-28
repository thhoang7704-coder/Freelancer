package com.example.freelancer.module.freelancer.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamListResponse {

    private UUID teamId;

    private String teamName;

    private TeamProjectInfoResponse project;

    private List<TeamListMemberResponse> members;

    private OffsetDateTime createdAt;
}