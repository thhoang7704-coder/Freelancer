package com.example.freelancer.module.company.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SetLeaderResponse {

    private UUID memberId;

    private Boolean isLeader;
}