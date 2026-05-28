package com.example.freelancer.module.freelancer.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamListMemberResponse {

    private UUID memberId;

    private UUID freelancerId;

    private String fullName;

    private String email;

    private Boolean isLeader;

    private OffsetDateTime joinedAt;
}