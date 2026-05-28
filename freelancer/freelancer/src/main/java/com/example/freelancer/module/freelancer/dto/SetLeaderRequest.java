package com.example.freelancer.module.freelancer.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetLeaderRequest {

    @NotNull
    private UUID freelancerId;
}