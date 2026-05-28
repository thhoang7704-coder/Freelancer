package com.example.freelancer.module.task.dto;

import com.example.freelancer.enums.TaskStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTaskStatusRequest {

    @NotNull
    private TaskStatus status;
}