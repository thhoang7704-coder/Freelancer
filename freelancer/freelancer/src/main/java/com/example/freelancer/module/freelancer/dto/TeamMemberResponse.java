package com.example.freelancer.module.freelancer.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamMemberResponse {

    private UUID memberId;

    private UUID freelancerId;

    private String freelancerName;

    private Boolean isLeader;
}
