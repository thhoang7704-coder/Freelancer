package com.example.freelancer.module.Project.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.Project.entity.ProjectApplication;

public interface ProjectApplicationRepository extends JpaRepository<ProjectApplication, UUID> {
        boolean existsByProjectIdAndFreelancerId(UUID projectId, UUID freelancerId);

        @Query("""
                            SELECT pa FROM ProjectApplication pa
                            WHERE pa.freelancer.id = :freelancerId
                            AND (:status IS NULL OR pa.status = :status)
                            ORDER BY pa.appliedAt DESC
                        """)
        Page<ProjectApplication> findMyApplications(
                        @Param("freelancerId") UUID freelancerId,
                        @Param("status") ApprovalStatus status,
                        Pageable pageable);

        // tìm kiếm tất cả ứng viên của một dự án, có thể lọc theo trạng thái ứng dụng
        // (đã duyệt, đang chờ duyệt, bị từ chối)
        @Query("""
                            SELECT pa FROM ProjectApplication pa
                            WHERE pa.project.id = :projectId
                            AND (:status IS NULL OR pa.status = :status)
                            ORDER BY pa.appliedAt DESC
                        """)
        Page<ProjectApplication> findByProjectId(
                        @Param("projectId") UUID projectId,
                        @Param("status") ApprovalStatus status,
                        Pageable pageable);

        long countByProjectId(UUID projectId);

        long countByProjectIdAndStatus(UUID projectId, ApprovalStatus status);
}
