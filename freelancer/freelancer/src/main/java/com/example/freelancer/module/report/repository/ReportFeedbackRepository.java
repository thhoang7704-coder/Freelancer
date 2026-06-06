package com.example.freelancer.module.report.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.freelancer.enums.FeedbackType;
import com.example.freelancer.module.report.entity.ReportFeedback;

public interface ReportFeedbackRepository extends JpaRepository<ReportFeedback, UUID> {
    // Tìm tất cả feedback của một báo cáo
    List<ReportFeedback> findByReportIdOrderByCreatedAtAsc(UUID reportId);

    // Tìm feedback của một báo cáo, nhưng LỌC THEO TYPE (Dành cho Freelancer chỉ
    // xem loại LEADER_TO_FREELANCER)
    List<ReportFeedback> findByReportIdAndTypeOrderByCreatedAtAsc(UUID reportId, FeedbackType type);

}
