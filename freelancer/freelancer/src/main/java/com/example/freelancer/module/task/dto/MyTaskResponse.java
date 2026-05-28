package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyTaskResponse {

    private UUID taskId;

    private UUID projectId;

    private String projectName;

    private String title;

    private String description;

    private String fileUrl;

    private TaskStatus status;

    private TaskType taskType;

    private OffsetDateTime deadline;

    private OffsetDateTime createdAt;
}
