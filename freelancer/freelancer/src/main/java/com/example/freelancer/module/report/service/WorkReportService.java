package com.example.freelancer.module.report.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.common.exception.ForbiddenException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.module.Project.service.CloudinaryService;
import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.example.freelancer.module.freelancer.repository.FreelancerRepository;
import com.example.freelancer.module.report.dto.WorkReportResponse;
import com.example.freelancer.module.report.entity.WorkReport;
import com.example.freelancer.module.report.repository.WorkReportRepository;
import com.example.freelancer.module.report.service.interfaces.IWorkReportService;
import com.example.freelancer.module.task.entity.Task;
import com.example.freelancer.module.task.repository.TaskRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class WorkReportService implements IWorkReportService {

    private final WorkReportRepository reportRepository;
    private final TaskRepository taskRepository;
    private final CloudinaryService cloudinaryService;
    private final FreelancerRepository freelancerRepository;

    // Nộp báo cáo
    public WorkReportResponse submitReport(UUID taskId, String content, MultipartFile file) {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("404", "Task không tồn tại"));
        Freelancer freelancer = freelancerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("404", "Không tìm thấy hồ sơ Freelancer của bạn"));
        if (task.getAssignedTo() == null) {
            throw new RuntimeException("Task này chưa được phân công cho ai, bạn không thể báo cáo!");
        }

        if (!task.getAssignedTo().getId().equals(freelancer.getId())) {
            throw new ForbiddenException("Bạn không có quyền báo cáo cho Task này vì nó không được giao cho bạn!");

        }
        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new RuntimeException("Task này không ở trạng thái IN_PROGRESS, bạn không thể nộp báo cáo!");
        }
        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            fileUrl = cloudinaryService.uploadFile(file);
        }
        WorkReport report = WorkReport.builder()
                .task(task)
                .reporter(freelancer)
                .content(content)
                .fileUrl(fileUrl)
                .build();
        reportRepository.save(report);
        return mapToResponse(report);
    }

    @Override
    public List<WorkReportResponse> getReportsByTask(UUID taskId) {
        return reportRepository.findByTaskIdOrderByReportedAtDesc(taskId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private WorkReportResponse mapToResponse(WorkReport report) {
        return WorkReportResponse.builder()
                .id(report.getId())
                .taskId(report.getTask().getId())
                .reporterName(report.getReporter().getUser().getFullName())
                .content(report.getContent())
                .fileUrl(report.getFileUrl())
                .reportedAt(report.getReportedAt())
                .build();
    }

    @Override
    public List<WorkReportResponse> getMyReports() {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
        return reportRepository.findByReporter_User_IdOrderByReportedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public WorkReportResponse updateReport(UUID reportId, String content, MultipartFile file) {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        WorkReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("404", "Báo cáo không tồn tại"));
        // kiểm tra
        if (!report.getReporter().getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền sửa báo cáo của người khác!");
        }
        Task task = report.getTask();
        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new RuntimeException("Task này không ở trạng thái IN_PROGRESS, bạn không thể sửa báo cáo!");
        }
        // Cập nhật nội dung mới
        report.setContent(content);
        // Xem thử Freelancer có đính kèm file mới -> Up đè lên và thay link url
        // (Còn nếu không up file mới thì vẫn giữ nguyên link file cũ)
        if (file != null && !file.isEmpty()) {
            String newFileUrl = cloudinaryService.uploadFile(file);
            report.setFileUrl(newFileUrl);
        }
        reportRepository.save(report);
        return mapToResponse(report);
    }

}
