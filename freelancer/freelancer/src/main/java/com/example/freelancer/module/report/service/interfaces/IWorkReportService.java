package com.example.freelancer.module.report.service.interfaces;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.module.report.dto.WorkReportResponse;

public interface IWorkReportService {
    public WorkReportResponse submitReport(UUID taskId, String content, MultipartFile file);

    public List<WorkReportResponse> getReportsByTask(UUID taskId);

    // freelancer xem lại những báo cáo mà mình đã viết
    public List<WorkReportResponse> getMyReports();

    WorkReportResponse updateReport(UUID reportId, String content, MultipartFile file);
}
