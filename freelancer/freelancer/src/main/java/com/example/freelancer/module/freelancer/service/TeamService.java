package com.example.freelancer.module.freelancer.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.freelancer.dto.AddTeamMemberRequest;
import com.example.freelancer.module.freelancer.dto.CreateTeamRequest;
import com.example.freelancer.module.freelancer.dto.TeamDetailMemberResponse;
import com.example.freelancer.module.freelancer.dto.TeamDetailResponse;
import com.example.freelancer.module.freelancer.dto.TeamListMemberResponse;
import com.example.freelancer.module.freelancer.dto.TeamListResponse;
import com.example.freelancer.module.freelancer.dto.TeamMemberResponse;
import com.example.freelancer.module.freelancer.dto.TeamProjectInfoResponse;
import com.example.freelancer.module.freelancer.dto.TeamResponse;
import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.example.freelancer.module.freelancer.entity.Team;
import com.example.freelancer.module.freelancer.entity.TeamMember;
import com.example.freelancer.module.freelancer.repository.FreelancerRepository;
import com.example.freelancer.module.freelancer.repository.TeamMemberRepository;
import com.example.freelancer.module.freelancer.repository.TeamRepository;
import com.example.freelancer.module.freelancer.service.interfaces.ITeamService;
import com.example.freelancer.module.notification.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamService implements ITeamService {
        private final TeamRepository teamRepository;
        private final FreelancerRepository freelancerRepository;
        private final ProjectRepository projectRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final NotificationService notificationService;

        @Override
        @Transactional
        public TeamResponse createTeam(CreateTeamRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(request.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                // check owner
                if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền tạo team cho project này");
                }

                // create team
                Team team = new Team();
                team.setProject(project);
                team.setName(request.getName());

                Team savedTeam = teamRepository.save(team);

                List<TeamMemberResponse> memberResponses = new ArrayList<>();

                // add members
                if (request.getMemberIds() != null) {

                        for (UUID freelancerId : request.getMemberIds()) {

                                Freelancer freelancer = freelancerRepository.findById(freelancerId)
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "404",
                                                                "Freelancer not found"));

                                // must belong to project
                                boolean exists = projectMemberRepository
                                                .existsByProjectIdAndFreelancerId(
                                                                project.getId(),
                                                                freelancerId);

                                if (!exists) {
                                        throw new BadRequestException(
                                                        "400",
                                                        "Freelancer chưa thuộc project");
                                }

                                TeamMember member = new TeamMember();
                                member.setTeam(savedTeam);
                                member.setFreelancer(freelancer);

                                // leader
                                boolean isLeader = memberResponses.isEmpty();

                                member.setIsLeader(isLeader);
                                if (isLeader) {

                                        List<ProjectMember> projectMembers = projectMemberRepository
                                                        .findByProjectId(project.getId());

                                        for (ProjectMember pm : projectMembers) {

                                                pm.setLeader(
                                                                pm.getFreelancer().getId().equals(freelancerId));
                                        }

                                        projectMemberRepository.saveAll(projectMembers);
                                }
                                TeamMember savedMember = teamMemberRepository.save(member);
                                // notification leader đầu tiên, leader được chọn khi tạo team sẽ nhận được
                                // notification
                                if (isLeader) {

                                        notificationService.createNotification(
                                                        freelancer.getUser(),
                                                        "Bạn đã được chọn làm leader team",
                                                        "Bạn đã được chọn làm leader của team \""
                                                                        + savedTeam.getName()
                                                                        + "\" trong dự án \""
                                                                        + project.getName()
                                                                        + "\"",
                                                        NotificationType.LEADER_ASSIGNED,
                                                        project.getId());
                                }
                                memberResponses.add(
                                                TeamMemberResponse.builder()
                                                                .memberId(savedMember.getId())
                                                                .freelancerId(freelancer.getId())
                                                                .freelancerName(
                                                                                freelancer.getUser().getFullName())
                                                                .isLeader(savedMember.getIsLeader())
                                                                .build());
                        }
                }

                return TeamResponse.builder()
                                .teamId(savedTeam.getId())
                                .projectId(project.getId())
                                .name(savedTeam.getName())
                                .members(memberResponses)
                                .createdAt(OffsetDateTime.now())
                                .build();
        }

        // xem chi tiết từng team, bao gồm thông tin các thành viên trong team đó
        @Override
        public TeamDetailResponse getTeamDetail(UUID teamId) {

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Team not found"));

                List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);

                List<TeamDetailMemberResponse> memberResponses = members.stream()
                                .map(member -> TeamDetailMemberResponse.builder()
                                                .memberId(member.getId())
                                                .freelancerId(
                                                                member.getFreelancer().getId())
                                                .fullName(
                                                                member.getFreelancer()
                                                                                .getUser()
                                                                                .getFullName())
                                                .isLeader(member.getIsLeader())
                                                .joinedAt(member.getJoinedAt())
                                                .build())
                                .toList();

                return TeamDetailResponse.builder()
                                .teamId(team.getId())
                                .projectId(team.getProject().getId())
                                .name(team.getName())
                                .members(memberResponses)
                                .createdAt(team.getCreatedAt())
                                .build();
        }

        // thêm thành viên vào team,Chỉ company owner được add member
        // Freelancer phải thuộc project
        @Override
        @Transactional
        public void addMemberToTeam(
                        UUID teamId,
                        AddTeamMemberRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Team not found"));

                // check company owner
                if (!team.getProject()
                                .getCompany()
                                .getUser()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền thêm thành viên");
                }

                Freelancer freelancer = freelancerRepository
                                .findById(request.getFreelancerId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Freelancer not found"));

                // BUSINESS RULE 1:
                // freelancer phải thuộc project trước
                boolean isProjectMember = projectMemberRepository
                                .existsByProjectIdAndFreelancerId(
                                                team.getProject().getId(),
                                                freelancer.getId());

                if (!isProjectMember) {
                        throw new BadRequestException(
                                        "400",
                                        "Freelancer chưa thuộc project");
                }

                // BUSINESS RULE 2:
                // không add trùng team
                boolean existed = teamMemberRepository
                                .existsByTeamIdAndFreelancerId(
                                                teamId,
                                                freelancer.getId());

                if (existed) {
                        throw new BadRequestException(
                                        "400",
                                        "Freelancer đã thuộc team");
                }

                TeamMember member = new TeamMember();
                member.setTeam(team);
                member.setFreelancer(freelancer);
                member.setIsLeader(false);
                member.setJoinedAt(OffsetDateTime.now());

                teamMemberRepository.save(member);
                // notification cho thành viên khi được thêm vào dự án
                notificationService.createNotification(
                                freelancer.getUser(),
                                "Bạn đã được thêm vào team",
                                "Bạn đã được thêm vào team \""
                                                + team.getName()
                                                + "\" của dự án \""
                                                + team.getProject().getName()
                                                + "\""
                                                + " thuộc công ty \""
                                                + team.getProject().getCompany().getCompanyName()
                                                + "\"",
                                NotificationType.TEAM_MEMBER_ADDED,
                                team.getProject().getId());
        }

        // xoá thành viên khỏi team, chỉ company owner được remove member
        @Override
        @Transactional
        public void removeMember(
                        UUID teamId,
                        UUID memberId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Team not found"));

                // CHECK OWNER
                if (!team.getProject()
                                .getCompany()
                                .getUser()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền xóa thành viên");
                }

                TeamMember member = teamMemberRepository
                                .findByIdAndTeamId(memberId, teamId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Member not found"));

                // BUSINESS RULE:
                // không cho xóa leader
                if (Boolean.TRUE.equals(member.getIsLeader())) {

                        throw new BadRequestException(
                                        "400",
                                        "Không thể xóa trưởng nhóm");
                }
                // notification cho người bị xóa khỏi team
                notificationService.createNotification(
                                member.getFreelancer().getUser(),
                                "Bạn đã bị xóa khỏi team",
                                "Bạn đã bị xóa khỏi team \""
                                                + team.getName()
                                                + "\" của dự án \""
                                                + team.getProject().getName()
                                                + "\"",
                                NotificationType.TEAM_MEMBER_REMOVED,
                                team.getProject().getId());

                teamMemberRepository.delete(member);
        }

        @Override
        public List<TeamMemberResponse> getTeamMembers(UUID teamId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Team not found"));

                // CHECK OWNER COMPANY
                if (!team.getProject()
                                .getCompany()
                                .getUser()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền xem team này");
                }

                List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);

                return members.stream()
                                .map(member -> TeamMemberResponse.builder()
                                                .memberId(member.getId())
                                                .freelancerId(member.getFreelancer().getId())
                                                .freelancerName(
                                                                member.getFreelancer()
                                                                                .getUser()
                                                                                .getFullName())
                                                .isLeader(member.getIsLeader())
                                                .build())
                                .toList();
        }

        // lấy danh sách team có trong dự án
        @Override
        public List<TeamListResponse> getAllTeams() {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                List<Team> teams = teamRepository
                                .findByProjectCompanyUserIdOrderByCreatedAtDesc(
                                                currentUser.getId());

                return teams.stream()
                                .map(team -> {

                                        Project project = team.getProject();

                                        List<TeamMember> members = teamMemberRepository
                                                        .findByTeamId(team.getId());

                                        List<TeamListMemberResponse> memberResponses = members.stream()
                                                        .map(member -> TeamListMemberResponse.builder()
                                                                        .memberId(member.getId())
                                                                        .freelancerId(member.getFreelancer().getId())
                                                                        .fullName(
                                                                                        member.getFreelancer()
                                                                                                        .getUser()
                                                                                                        .getFullName())
                                                                        .email(
                                                                                        member.getFreelancer()
                                                                                                        .getUser()
                                                                                                        .getEmail())
                                                                        .isLeader(member.getIsLeader())
                                                                        .joinedAt(member.getJoinedAt())
                                                                        .build())
                                                        .toList();

                                        return TeamListResponse.builder()
                                                        .teamId(team.getId())
                                                        .teamName(team.getName())
                                                        .project(
                                                                        TeamProjectInfoResponse.builder()
                                                                                        .projectId(project.getId())
                                                                                        .projectName(project.getName())
                                                                                        .budget(project.getBudget())
                                                                                        .deadline(project.getDeadline())
                                                                                        .status(project.getStatus())
                                                                                        .progressStatus(project
                                                                                                        .getProgressStatus())
                                                                                        .paymentStatus(project
                                                                                                        .getPaymentStatus())
                                                                                        .build())
                                                        .members(memberResponses)
                                                        .createdAt(team.getCreatedAt())
                                                        .build();
                                })
                                .toList();
        }

        // lấy danh sách team mà freelancer hiện tại đang tham gia
        @Override
        public List<TeamListResponse> getMyTeams() {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Freelancer freelancer = freelancerRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404", "Freelancer profile not found"));

                List<Team> teams = teamRepository
                                .findByMembersFreelancerIdOrderByCreatedAtDesc(
                                                freelancer.getId());

                return teams.stream()
                                .map(team -> {

                                        Project project = team.getProject();

                                        List<TeamMember> members = teamMemberRepository
                                                        .findByTeamId(team.getId());

                                        List<TeamListMemberResponse> memberResponses = members.stream()
                                                        .map(member -> TeamListMemberResponse.builder()
                                                                        .memberId(member.getId())
                                                                        .freelancerId(member.getFreelancer().getId())
                                                                        .fullName(
                                                                                        member.getFreelancer()
                                                                                                        .getUser()
                                                                                                        .getFullName())
                                                                        .email(
                                                                                        member.getFreelancer()
                                                                                                        .getUser()
                                                                                                        .getEmail())
                                                                        .isLeader(member.getIsLeader())
                                                                        .joinedAt(member.getJoinedAt())
                                                                        .build())
                                                        .toList();

                                        return TeamListResponse.builder()
                                                        .teamId(team.getId())
                                                        .teamName(team.getName())
                                                        .project(
                                                                        TeamProjectInfoResponse.builder()
                                                                                        .projectId(project.getId())
                                                                                        .projectName(project.getName())
                                                                                        .budget(project.getBudget())
                                                                                        .deadline(project.getDeadline())
                                                                                        .status(project.getStatus())
                                                                                        .progressStatus(project
                                                                                                        .getProgressStatus())
                                                                                        .paymentStatus(project
                                                                                                        .getPaymentStatus())
                                                                                        .build())
                                                        .members(memberResponses)
                                                        .createdAt(team.getCreatedAt())
                                                        .build();
                                })
                                .toList();
        }
}
