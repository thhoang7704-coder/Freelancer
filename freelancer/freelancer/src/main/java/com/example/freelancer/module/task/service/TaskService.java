package com.example.freelancer.module.task.service;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.example.freelancer.module.freelancer.repository.FreelancerRepository;
import com.example.freelancer.module.notification.service.NotificationService;
import com.example.freelancer.module.task.dto.CreateTaskRequest;
import com.example.freelancer.module.task.dto.LeaderTaskOverviewResponse;
import com.example.freelancer.module.task.dto.MyTaskResponse;
import com.example.freelancer.module.task.dto.OpenTaskResponse;
import com.example.freelancer.module.task.dto.ProjectTaskResponse;
import com.example.freelancer.module.task.dto.TaskDetailResponse;
import com.example.freelancer.module.task.dto.TaskResponse;
import com.example.freelancer.module.task.dto.UpdateTaskStatusRequest;
import com.example.freelancer.module.task.entity.Task;
import com.example.freelancer.module.task.repository.TaskRepository;
import com.example.freelancer.module.task.service.interfaces.ITaskService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService implements ITaskService {

        private final TaskRepository taskRepository;
        private final ProjectRepository projectRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final FreelancerRepository freelancerRepository;
        private final Cloudinary cloudinary;
        private final NotificationService notificationService;

        @Override
        @Transactional
        public TaskResponse createTask(CreateTaskRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(request.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Project not found"));

                // CHECK LEADER
                ProjectMember leader = projectMemberRepository
                                .findByProjectIdAndFreelancerUserId(
                                                project.getId(),
                                                currentUser.getId())
                                .orElseThrow(() -> new BadRequestException(
                                                "403",
                                                "Bạn không thuộc project"));

                if (!Boolean.TRUE.equals(leader.isLeader())) {

                        throw new BadRequestException(
                                        "403",
                                        "Chỉ leader mới được tạo task");
                }

                Freelancer assignedFreelancer = null;

                // ASSIGNED TASK
                if (request.getTaskType() == TaskType.ASSIGNED) {

                        if (request.getAssignedTo() == null) {

                                throw new BadRequestException(
                                                "400",
                                                "Task ASSIGNED phải có assignedTo");
                        }

                        assignedFreelancer = freelancerRepository
                                        .findById(request.getAssignedTo())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "404",
                                                        "Freelancer not found"));

                        // CHECK freelancer thuộc project
                        boolean isProjectMember = projectMemberRepository
                                        .existsByProjectIdAndFreelancerId(
                                                        project.getId(),
                                                        assignedFreelancer.getId());

                        if (!isProjectMember) {

                                throw new BadRequestException(
                                                "400",
                                                "Freelancer không thuộc project");
                        }
                }

                // UPLOAD FILE
                String fileUrl = null;

                MultipartFile file = request.getFile();

                if (file != null && !file.isEmpty()) {

                        try {

                                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                                                file.getBytes(),
                                                Map.of(
                                                                "resource_type", "auto",
                                                                "folder", "freelancer/tasks"));

                                fileUrl = uploadResult.get("secure_url").toString();

                        } catch (IOException e) {

                                throw new BadRequestException(
                                                "400",
                                                "Upload file thất bại");
                        }
                }

                Task task = Task.builder()
                                .project(project)
                                .assignedTo(assignedFreelancer)
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .fileUrl(fileUrl)
                                .deadline(request.getDeadline())
                                .taskType(request.getTaskType())
                                .status(TaskStatus.TODO)
                                .createdBy(currentUser.getId())
                                .isLocked(request.getTaskType() == TaskType.ASSIGNED)
                                .assignedAt(
                                                assignedFreelancer != null
                                                                ? OffsetDateTime.now()
                                                                : null)
                                .build();

                Task savedTask = taskRepository.saveAndFlush(task);
                // =========================
                // NOTIFICATION
                // =========================

                // TASK OPEN -> gửi cho toàn bộ member project
                if (request.getTaskType() == TaskType.OPEN) {

                        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(project.getId());

                        for (ProjectMember member : projectMembers) {

                                notificationService.createNotification(
                                                member.getFreelancer().getUser(),
                                                "Task mới từ leader",
                                                "Leader vừa tạo task \"" +
                                                                savedTask.getTitle() +
                                                                "\" trong dự án \"" +
                                                                project.getName() +
                                                                "\"",
                                                NotificationType.TASK_CREATED,
                                                savedTask.getId());
                        }
                }

                // TASK ASSIGNED -> chỉ gửi cho người được assign
                if (request.getTaskType() == TaskType.ASSIGNED
                                && assignedFreelancer != null) {

                        notificationService.createNotification(
                                        assignedFreelancer.getUser(),
                                        "Bạn được giao task mới",
                                        "Bạn vừa được giao task \"" +
                                                        savedTask.getTitle() +
                                                        "\" trong dự án \"" +
                                                        project.getName() +
                                                        "\"",
                                        NotificationType.TASK_ASSIGNED,
                                        savedTask.getId());
                }

                return TaskResponse.builder()
                                .taskId(savedTask.getId())
                                .projectId(project.getId())
                                .assignedTo(
                                                savedTask.getAssignedTo() != null
                                                                ? savedTask.getAssignedTo().getId()
                                                                : null)
                                .title(savedTask.getTitle())
                                .fileUrl(savedTask.getFileUrl())
                                .status(savedTask.getStatus())
                                .taskType(savedTask.getTaskType())
                                .createdBy(savedTask.getCreatedBy())
                                .createdAt(savedTask.getCreatedAt())
                                .build();
        }

        @Override
        public List<OpenTaskResponse> getOpenTasks(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                // CHECK FREELANCER THUỘC PROJECT
                projectMemberRepository
                                .findByProjectIdAndFreelancerUserId(
                                                projectId,
                                                currentUser.getId())
                                .orElseThrow(() -> new BadRequestException(
                                                "403",
                                                "Bạn không thuộc project"));

                // GET OPEN TASKS
                List<Task> tasks = taskRepository
                                .findByProjectIdAndTaskTypeAndStatusAndIsLockedFalse(
                                                projectId,
                                                TaskType.OPEN,
                                                TaskStatus.TODO);

                return tasks.stream()
                                .map(task -> OpenTaskResponse.builder()
                                                .taskId(task.getId())
                                                .title(task.getTitle())
                                                .description(task.getDescription())
                                                .fileUrl(task.getFileUrl())
                                                .deadline(task.getDeadline())
                                                .status(task.getStatus())
                                                .taskType(task.getTaskType())
                                                .createdAt(task.getCreatedAt())
                                                .build())
                                .toList();
        }

        // nhận task
        @Override
        @Transactional
        public TaskResponse claimTask(UUID taskId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                // FIND FREELANCER
                Freelancer freelancer = freelancerRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Freelancer not found"));

                // FIND TASK
                Task task = taskRepository
                                .findByIdAndTaskType(taskId, TaskType.OPEN)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Open task not found"));

                // CHECK TASK ĐÃ BỊ NHẬN CHƯA
                if (Boolean.TRUE.equals(task.getIsLocked())) {

                        throw new BadRequestException(
                                        "400",
                                        "Task đã được người khác nhận");
                }

                // CHECK FREELANCER CÓ THUỘC PROJECT KHÔNG
                boolean isProjectMember = projectMemberRepository
                                .existsByProjectIdAndFreelancerId(
                                                task.getProject().getId(),
                                                freelancer.getId());

                if (!isProjectMember) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không thuộc project");
                }

                // CLAIM TASK
                task.setAssignedTo(freelancer);

                task.setIsLocked(true);

                task.setAssignedAt(OffsetDateTime.now());

                task.setStatus(TaskStatus.IN_PROGRESS);

                Task savedTask = taskRepository.save(task);

                return TaskResponse.builder()
                                .taskId(savedTask.getId())
                                .projectId(savedTask.getProject().getId())
                                .assignedTo(savedTask.getAssignedTo().getId())
                                .title(savedTask.getTitle())
                                .fileUrl(savedTask.getFileUrl())
                                .status(savedTask.getStatus())
                                .taskType(savedTask.getTaskType())
                                .createdBy(savedTask.getCreatedBy())
                                .createdAt(savedTask.getCreatedAt())
                                .build();
        }

        @Override
        public List<MyTaskResponse> getMyTasks() {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Freelancer freelancer = freelancerRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Freelancer not found"));

                List<Task> tasks = taskRepository
                                .findByAssignedToId(freelancer.getId());

                return tasks.stream()
                                .map(task -> MyTaskResponse.builder()
                                                .taskId(task.getId())
                                                .projectId(task.getProject().getId())
                                                .projectName(task.getProject().getName())
                                                .title(task.getTitle())
                                                .description(task.getDescription())
                                                .fileUrl(task.getFileUrl())
                                                .status(task.getStatus())
                                                .taskType(task.getTaskType())
                                                .deadline(task.getDeadline())
                                                .createdAt(task.getCreatedAt())
                                                .build())
                                .toList();
        }

        // xem chi tiết task
        @Override
        public TaskDetailResponse getTaskDetail(UUID taskId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Freelancer freelancer = freelancerRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Freelancer not found"));

                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Task not found"));

                // CHECK TASK CÓ PHẢI CỦA FREELANCER KHÔNG
                if (task.getAssignedTo() == null ||
                                !task.getAssignedTo().getId().equals(freelancer.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền xem task này");
                }

                return TaskDetailResponse.builder()
                                .taskId(task.getId())
                                .projectId(task.getProject().getId())
                                .projectName(task.getProject().getName())
                                .assignedTo(
                                                task.getAssignedTo() != null
                                                                ? task.getAssignedTo().getId()
                                                                : null)
                                .assignedToName(
                                                task.getAssignedTo() != null
                                                                ? task.getAssignedTo()
                                                                                .getUser()
                                                                                .getFullName()
                                                                : null)
                                .title(task.getTitle())
                                .description(task.getDescription())
                                .fileUrl(task.getFileUrl())
                                .status(task.getStatus())
                                .taskType(task.getTaskType())
                                .deadline(task.getDeadline())
                                .createdBy(task.getCreatedBy())
                                .assignedAt(task.getAssignedAt())
                                .createdAt(task.getCreatedAt())
                                .build();
        }

        @Override
        @Transactional
        public TaskDetailResponse updateTaskStatus(
                        UUID taskId,
                        UpdateTaskStatusRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Freelancer freelancer = freelancerRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Freelancer not found"));

                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Task not found"));

                // CHECK TASK CÓ PHẢI CỦA FREELANCER KHÔNG
                if (task.getAssignedTo() == null ||
                                !task.getAssignedTo().getId().equals(freelancer.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền cập nhật task này");
                }

                // VALIDATE STATUS
                if (request.getStatus() != TaskStatus.IN_PROGRESS
                                && request.getStatus() != TaskStatus.DONE) {

                        throw new BadRequestException(
                                        "400",
                                        "Chỉ được cập nhật sang IN_PROGRESS hoặc DONE");
                }

                // UPDATE STATUS
                task.setStatus(request.getStatus());

                Task savedTask = taskRepository.save(task);

                return TaskDetailResponse.builder()
                                .taskId(savedTask.getId())
                                .projectId(savedTask.getProject().getId())
                                .projectName(savedTask.getProject().getName())
                                .assignedTo(savedTask.getAssignedTo().getId())
                                .assignedToName(
                                                savedTask.getAssignedTo()
                                                                .getUser()
                                                                .getFullName())
                                .title(savedTask.getTitle())
                                .description(savedTask.getDescription())
                                .fileUrl(savedTask.getFileUrl())
                                .status(savedTask.getStatus())
                                .taskType(savedTask.getTaskType())
                                .deadline(savedTask.getDeadline())
                                .createdBy(savedTask.getCreatedBy())
                                .assignedAt(savedTask.getAssignedAt())
                                .createdAt(savedTask.getCreatedAt())
                                .build();
        }

        // chỉ leader mới được xem tất cả task của project
        @Override
        public List<ProjectTaskResponse> getProjectTasks(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                // CHECK PROJECT MEMBER
                ProjectMember leader = projectMemberRepository
                                .findByProjectIdAndFreelancerUserId(
                                                projectId,
                                                currentUser.getId())
                                .orElseThrow(() -> new BadRequestException(
                                                "403",
                                                "Bạn không thuộc project"));

               

                List<Task> tasks = taskRepository
                                .findByProjectIdOrderByCreatedAtDesc(projectId);

                return tasks.stream()
                                .map(task -> ProjectTaskResponse.builder()
                                                .taskId(task.getId())
                                                .title(task.getTitle())
                                                .description(task.getDescription())
                                                .projectName(task.getProject().getName())
                                                .assignedTo(
                                                                task.getAssignedTo() != null
                                                                                ? task.getAssignedTo().getId()
                                                                                : null)
                                                .assignedToName(
                                                                task.getAssignedTo() != null
                                                                                ? task.getAssignedTo()
                                                                                                .getUser()
                                                                                                .getFullName()
                                                                                : "Chưa có người nhận")
                                                .status(task.getStatus())
                                                .taskType(task.getTaskType())
                                                .fileUrl(task.getFileUrl())
                                                .deadline(task.getDeadline())
                                                .createdAt(task.getCreatedAt())
                                                .build())
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public List<LeaderTaskOverviewResponse> getProjectTasksForLeader(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                // CHECK LEADER
                ProjectMember leader = projectMemberRepository
                                .findByProjectIdAndFreelancerUserId(
                                                projectId,
                                                currentUser.getId())
                                .orElseThrow(() -> new BadRequestException(
                                                "403",
                                                "Bạn không thuộc project"));

                if (!Boolean.TRUE.equals(leader.isLeader())) {

                        throw new BadRequestException(
                                        "403",
                                        "Chỉ leader mới được xem task");
                }

                List<Task> tasks = taskRepository
                                .findByProjectIdOrderByCreatedAtDesc(projectId);

                return tasks.stream()
                                .map(task -> {

                                        boolean assigned = task.getAssignedTo() != null;

                                        return LeaderTaskOverviewResponse.builder()
                                                        .taskId(task.getId())
                                                        .title(task.getTitle())
                                                        .description(task.getDescription())
                                                        .taskType(task.getTaskType())
                                                        .status(task.getStatus())

                                                        .assigned(assigned)

                                                        .freelancerId(
                                                                        assigned
                                                                                        ? task.getAssignedTo().getId()
                                                                                        : null)

                                                        .freelancerName(
                                                                        assigned
                                                                                        ? task.getAssignedTo()
                                                                                                        .getUser()
                                                                                                        .getFullName()
                                                                                        : null)

                                                        .deadline(task.getDeadline())
                                                        .createdAt(task.getCreatedAt())
                                                        .build();
                                })
                                .toList();
        }
}
