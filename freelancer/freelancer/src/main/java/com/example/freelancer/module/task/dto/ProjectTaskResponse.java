package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectTaskResponse {

    private UUID taskId;

    private String title;

    private String description;

    private String projectName;

    private UUID assignedTo;

    private String assignedToName;

    private TaskStatus status;

    private TaskType taskType;

    private String fileUrl;

    private OffsetDateTime deadline;

    private OffsetDateTime createdAt;
}
