package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskResponse {

    private UUID taskId;

    private UUID projectId;

    private UUID assignedTo;

    private String title;

    private String fileUrl;

    private TaskStatus status;

    private TaskType taskType;

    private UUID createdBy;

    private OffsetDateTime createdAt;
}
