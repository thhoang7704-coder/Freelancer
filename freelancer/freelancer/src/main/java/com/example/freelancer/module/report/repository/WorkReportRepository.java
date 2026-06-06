package com.example.freelancer.module.report.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.report.entity.WorkReport;

@Repository
public interface WorkReportRepository extends JpaRepository<WorkReport, UUID> {
    List<WorkReport> findByTaskIdOrderByReportedAtDesc(UUID taskId);

    // freelancer tìm mấy báo cáo mà mình viết
    List<WorkReport> findByReporter_User_IdOrderByReportedAtDesc(UUID userId);

    // leader xem báo cáo dự án mà mình tham gia
    List<WorkReport> findByTask_Project_IdOrderByReportedAtDesc(UUID projectId);

}
