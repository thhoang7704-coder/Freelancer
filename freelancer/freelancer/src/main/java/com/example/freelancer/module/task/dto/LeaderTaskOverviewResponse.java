package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LeaderTaskOverviewResponse {

    private UUID taskId;

    private String title;

    private String description;

    private TaskType taskType;

    private TaskStatus status;

    // true = đã có người nhận
    // false = chưa ai nhận
    private boolean assigned;

    private UUID freelancerId;

    private String freelancerName;

    private OffsetDateTime deadline;

    private OffsetDateTime createdAt;
}