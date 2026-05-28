package com.example.freelancer.module.Project.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.module.Project.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {
    Optional<Project> findByCompanyId(UUID companyId);

    Page<Project> findByStatus(
            ApprovalStatus status,
            Pageable pageable);

    long countByStatus(ApprovalStatus status);

    @Query("""
            SELECT DISTINCT p
            FROM Project p
            LEFT JOIN FETCH p.attachments
            """)
    List<Project> findAllProjectsWithAttachments();

    List<Project> findByCompanyUserId(UUID userId);

}