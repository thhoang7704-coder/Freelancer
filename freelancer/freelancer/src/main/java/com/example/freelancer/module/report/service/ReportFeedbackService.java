package com.example.freelancer.module.report.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.FeedbackType;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.service.CloudinaryService;
import com.example.freelancer.module.report.dto.ReportFeedbackResponse;
import com.example.freelancer.module.report.entity.ReportFeedback;
import com.example.freelancer.module.report.entity.WorkReport;
import com.example.freelancer.module.report.repository.ReportFeedbackRepository;
import com.example.freelancer.module.report.repository.WorkReportRepository;
import com.example.freelancer.module.report.service.interfaces.IReportFeedbackService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportFeedbackService implements IReportFeedbackService {
    private final ReportFeedbackRepository feedbackRepository;
    private final WorkReportRepository reportRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public ReportFeedbackResponse addLeaderFeedback(UUID reportId, String content, MultipartFile file) {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
        WorkReport report = getReport(reportId);

        UUID projectId = report.getTask().getProject().getId();
        boolean isProjectLeader = projectMemberRepository
                .findByProjectIdAndFreelancerUserId(projectId, currentUser.getId())
                .map(ProjectMember::isLeader).orElse(false);
        if (!isProjectLeader)
            throw new RuntimeException("Chỉ Leader mới được feedback cho Freelancer!");
        return saveFeedback(report, currentUser.getId(), FeedbackType.LEADER_TO_FREELANCER, content, file);
    }

    // công ty feedback cho leader
    @Override
    public ReportFeedbackResponse addCompanyFeedback(UUID reportId, String content, MultipartFile file) {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
        WorkReport report = getReport(reportId);

        UUID companyOwnerId = report.getTask().getProject().getCompany().getUser().getId();
        if (!currentUser.getId().equals(companyOwnerId)) {
            throw new RuntimeException("Chỉ Công ty mới được feedback kín cho Leader!");
        }
        return saveFeedback(report, currentUser.getId(), FeedbackType.COMPANY_TO_LEADER, content, file);
    }

    // lấy tất cả feedback của một báo cáo dựa vào có phải leader hay không, nếu là
    // leader thì xem được tất cả, nếu là freelancer thì chỉ xem được feedback của
    // leader
    @Override
    @Transactional(readOnly = true)
    public List<ReportFeedbackResponse> getFeedbacksOfReport(UUID reportId) {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
        WorkReport report = getReport(reportId);
        UUID projectId = report.getTask().getProject().getId();
        boolean isReporter = report.getReporter().getUser().getId().equals(currentUser.getId());
        boolean isCompanyOwner = report.getTask().getProject().getCompany().getUser().getId()
                .equals(currentUser.getId());
        boolean isProjectLeader = projectMemberRepository
                .findByProjectIdAndFreelancerUserId(projectId, currentUser.getId())
                .map(ProjectMember::isLeader).orElse(false);
        // nếu là người viết thì chỉ xem được của leader
        if (isReporter && !isProjectLeader) {
            return feedbackRepository
                    .findByReportIdAndTypeOrderByCreatedAtAsc(reportId, FeedbackType.LEADER_TO_FREELANCER)
                    .stream().map(this::mapToResponse).toList();
        }
        // nếu llafleader thì xem của công ty feedback
        if (isProjectLeader || isCompanyOwner) {
            return feedbackRepository.findByReportIdOrderByCreatedAtAsc(reportId)
                    .stream().map(this::mapToResponse).toList();
        }
        throw new RuntimeException("Bạn không có quyền xem feedback của báo cáo này!");
    }

    // viết 1 hàm riêng chạy chung để lấy báo cáo
    private WorkReport getReport(UUID reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("404", "Báo cáo không tồn tại"));
    }

    private ReportFeedbackResponse saveFeedback(WorkReport report, UUID authorId, FeedbackType type, String content,
            MultipartFile file) {
        String fileUrl = null;
        if (file != null && !file.isEmpty())
            fileUrl = cloudinaryService.uploadFile(file);

        User author = userRepository.findById(authorId).orElseThrow();
        ReportFeedback feedback = ReportFeedback.builder()
                .report(report)
                .author(author)
                .type(type)
                .content(content)
                .fileUrl(fileUrl)
                .build();

        feedbackRepository.save(feedback);
        return mapToResponse(feedback);
    }

    private ReportFeedbackResponse mapToResponse(ReportFeedback feedback) {
        return ReportFeedbackResponse.builder()
                .id(feedback.getId())
                .authorName(feedback.getAuthor().getFullName())
                .authorAvatar(feedback.getAuthor().getAvatarUrl())
                .type(feedback.getType())
                .content(feedback.getContent())
                .fileUrl(feedback.getFileUrl())
                .createdAt(feedback.getCreatedAt())
                .build();
    }

}
