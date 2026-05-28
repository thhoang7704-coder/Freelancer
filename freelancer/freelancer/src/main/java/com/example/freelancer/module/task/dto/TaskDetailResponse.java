package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TaskDetailResponse {

    private UUID taskId;

    private UUID projectId;

    private String projectName;

    private UUID assignedTo;

    private String assignedToName;

    private String title;

    private String description;

    private String fileUrl;

    private TaskStatus status;

    private TaskType taskType;

    private OffsetDateTime deadline;

    private UUID createdBy;

    private OffsetDateTime assignedAt;

    private OffsetDateTime createdAt;
}
