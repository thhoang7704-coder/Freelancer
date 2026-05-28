package com.example.freelancer.module.Project.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectMemberResponse {

    private UUID memberId;

    private UUID freelancerId;

    private String freelancerName;

    private boolean isLeader;

    private OffsetDateTime joinedAt;
}