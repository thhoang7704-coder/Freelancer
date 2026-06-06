package com.example.freelancer.module.report.service.interfaces;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.module.report.dto.ReportFeedbackResponse;

public interface IReportFeedbackService {
    public ReportFeedbackResponse addLeaderFeedback(UUID reportId, String content, MultipartFile file);

    public ReportFeedbackResponse addCompanyFeedback(UUID reportId, String content, MultipartFile file);

    public List<ReportFeedbackResponse> getFeedbacksOfReport(UUID reportId);
}
