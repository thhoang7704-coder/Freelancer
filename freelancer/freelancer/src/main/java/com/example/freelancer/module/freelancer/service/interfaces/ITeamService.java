package com.example.freelancer.module.freelancer.service.interfaces;

import java.util.List;
import java.util.UUID;

import com.example.freelancer.module.freelancer.dto.AddTeamMemberRequest;
import com.example.freelancer.module.freelancer.dto.CreateTeamRequest;
import com.example.freelancer.module.freelancer.dto.TeamDetailResponse;
import com.example.freelancer.module.freelancer.dto.TeamListResponse;
import com.example.freelancer.module.freelancer.dto.TeamMemberResponse;
import com.example.freelancer.module.freelancer.dto.TeamResponse;

public interface ITeamService {
    TeamResponse createTeam(CreateTeamRequest request);

    TeamDetailResponse getTeamDetail(UUID teamId);

    void addMemberToTeam(UUID teamId, AddTeamMemberRequest request);

    void removeMember(
            UUID teamId,
            UUID memberId);

    List<TeamMemberResponse> getTeamMembers(UUID teamId);

    List<TeamListResponse> getAllTeams();

    List<TeamListResponse> getMyTeams();
}
