package com.example.freelancer.module.freelancer.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.freelancer.entity.TeamMember;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {
        List<TeamMember> findByTeamId(UUID id);

        boolean existsByTeamIdAndFreelancerId(
                        UUID teamId,
                        UUID freelancerId);

        Optional<TeamMember> findByTeamIdAndFreelancerId(
                        UUID teamId,
                        UUID freelancerId);

        Optional<TeamMember> findByIdAndTeamId(
                        UUID memberId,
                        UUID teamId);

        List<TeamMember> findByTeamProjectIdAndFreelancerId(
                        UUID projectId,
                        UUID freelancerId);

}
