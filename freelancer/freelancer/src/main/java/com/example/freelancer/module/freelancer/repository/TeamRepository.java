package com.example.freelancer.module.freelancer.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.freelancer.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {
    // List<TeamMember> findByTeamId(UUID teamid);
    List<Team> findByProjectCompanyUserIdOrderByCreatedAtDesc(UUID userId);

    List<Team> findByMembersFreelancerIdOrderByCreatedAtDesc(UUID freelancerId);
}
