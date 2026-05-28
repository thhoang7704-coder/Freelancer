package com.example.freelancer.module.Project.dto;

import java.util.UUID;

import lombok.Getter;

@Getter
public class ApplyProjectRequest {
    private UUID projectId;
    private String coverLetter;
}
