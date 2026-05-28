package com.example.freelancer.module.task.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.freelancer.common.response.ApiResponse;
import com.example.freelancer.module.task.dto.CreateTaskRequest;
import com.example.freelancer.module.task.dto.UpdateTaskStatusRequest;
import com.example.freelancer.module.task.service.interfaces.ITaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TaskController {
    private final ITaskService taskService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('FREELANCER')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<?> createTask(
            @ModelAttribute CreateTaskRequest request) {

        return ApiResponse.ok(
                taskService.createTask(request),
                "Tạo task thành công");
    }

    // xem danh sách các task có trạng thái OPEN và chưa bị khóa của 1 project
    @GetMapping("/projects/{projectId}/open-tasks-freelancer")
    @PreAuthorize("hasRole('FREELANCER')")
    public ApiResponse<?> getOpenTasks(
            @PathVariable UUID projectId) {

        return ApiResponse.ok(
                taskService.getOpenTasks(projectId),
                "Lấy danh sách open task thành công");
    }

    // nhận task
    @PostMapping("/{taskId}/claim")
    @PreAuthorize("hasRole('FREELANCER')")
    public ApiResponse<?> claimTask(
            @PathVariable UUID taskId) {

        return ApiResponse.ok(
                taskService.claimTask(taskId),
                "Nhận task thành công");
    }

    // xem danh sách task của chính mình
    @GetMapping("/my-tasks")
    @PreAuthorize("hasRole('FREELANCER')")
    public ApiResponse<?> getMyTasks() {

        return ApiResponse.ok(
                taskService.getMyTasks(),
                "Lấy danh sách task thành công");
    }

    // xem chi tiết task
    @GetMapping("/{taskId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ApiResponse<?> getTaskDetail(
            @PathVariable UUID taskId) {

        return ApiResponse.ok(
                taskService.getTaskDetail(taskId),
                "Lấy chi tiết task thành công");
    }

    // cập nhật trạng thái task, chỉ có freelancer được giao task mới được cập nhật
    @PutMapping("/{taskId}/status")
    @PreAuthorize("hasRole('FREELANCER')")
    public ApiResponse<?> updateTaskStatus(
            @PathVariable UUID taskId,
            @RequestBody @Valid UpdateTaskStatusRequest request) {

        return ApiResponse.ok(
                taskService.updateTaskStatus(taskId, request),
                "Cập nhật trạng thái task thành công");
    }

    // chỉ leader mới được xem tất cả task của project
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasRole('FREELANCER')")
    public ApiResponse<?> getProjectTasks(
            @PathVariable UUID projectId) {

        return ApiResponse.ok(
                taskService.getProjectTasks(projectId),
                "Lấy danh sách task thành công");
    }
}
