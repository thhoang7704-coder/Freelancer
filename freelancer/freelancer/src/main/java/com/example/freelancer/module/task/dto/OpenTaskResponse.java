package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OpenTaskResponse {

    private UUID taskId;

    private String title;

    private String description;

    private String fileUrl;

    private OffsetDateTime deadline;

    private TaskStatus status;

    private TaskType taskType;

    private OffsetDateTime createdAt;
}