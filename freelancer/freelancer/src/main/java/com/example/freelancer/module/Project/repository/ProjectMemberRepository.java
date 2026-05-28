package com.example.freelancer.module.Project.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.freelancer.module.Project.entity.ProjectMember;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {

    @Query("SELECT CASE WHEN COUNT(pm) > 0 THEN TRUE ELSE FALSE END FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.leader = TRUE")
    boolean existsByProjectIdAndIsLeaderTrue(@Param("projectId") UUID projectId);

    List<ProjectMember> findByProjectId(UUID projectId);

    boolean existsByProjectIdAndFreelancerId(
            UUID projectId,
            UUID freelancerId);

    Optional<ProjectMember> findByProjectIdAndFreelancerUserId(
            UUID projectId,
            UUID userId);

    Optional<ProjectMember> findByProjectIdAndFreelancerId(
            UUID projectId,
            UUID freelancerId);
}
