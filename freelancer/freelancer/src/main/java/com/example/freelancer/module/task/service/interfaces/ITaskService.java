package com.example.freelancer.module.task.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.freelancer.module.task.dto.CreateTaskRequest;
import com.example.freelancer.module.task.dto.LeaderTaskOverviewResponse;
import com.example.freelancer.module.task.dto.MyTaskResponse;
import com.example.freelancer.module.task.dto.OpenTaskResponse;
import com.example.freelancer.module.task.dto.ProjectTaskResponse;
import com.example.freelancer.module.task.dto.TaskDetailResponse;
import com.example.freelancer.module.task.dto.TaskResponse;
import com.example.freelancer.module.task.dto.UpdateTaskStatusRequest;

public interface ITaskService {
    TaskResponse createTask(CreateTaskRequest request);

    // Lấy danh sách các task có trạng thái OPEN và chưa bị khóa
    List<OpenTaskResponse> getOpenTasks(UUID projectId);

    // nhận task
    TaskResponse claimTask(UUID taskId);

    List<MyTaskResponse> getMyTasks();

    // xem chi tiết task
    TaskDetailResponse getTaskDetail(UUID taskId);

    // cập nhật trạng thái task, chỉ có freelancer được giao task mới được cập nhật
    // trạng thái task
    TaskDetailResponse updateTaskStatus(
            UUID taskId,
            UpdateTaskStatusRequest request);

    // leader xem tất cả task của project, bao gồm cả task đã bị khóa
    List<ProjectTaskResponse> getProjectTasks(UUID projectId);

    // leader xem tất cả task của project, bao gồm cả task được nhận và chưa được
    // nhận
    List<LeaderTaskOverviewResponse> getProjectTasksForLeader(UUID projectId);
}
