package com.example.freelancer.module.freelancer.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTeamRequest {
    @NotNull
    private UUID projectId;

    @NotBlank
    private String name;

    private List<UUID> memberIds;

    // optional
    private UUID leaderId;
}
