package com.example.freelancer.module.task.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.enums.TaskType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTaskRequest {

    private UUID projectId;

    // nullable nếu task OPEN

    private UUID assignedTo;

    private String title;

    private String description;

    private MultipartFile file;

    private OffsetDateTime deadline;

    private TaskType taskType;
}