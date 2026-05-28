package com.example.freelancer.module.task.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;
import com.example.freelancer.module.task.entity.Task;

public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectIdAndTaskTypeAndIsLockedFalse(
            UUID projectId,
            TaskType taskType);

    List<Task> findByProjectIdAndTaskTypeAndStatusAndIsLockedFalse(
            UUID projectId,
            TaskType taskType,
            TaskStatus status);

    Optional<Task> findByIdAndTaskType(
            UUID id,
            TaskType taskType);

    List<Task> findByAssignedToIdOrderByCreatedAtDesc(
            UUID freelancerId);

    List<Task> findByAssignedToId(UUID freelancerId);

    List<Task> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    long countByProjectId(UUID projectId);

    long countByProjectIdAndStatus(UUID projectId, TaskStatus status);
}
