package com.example.freelancer.module.Project.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.common.response.PageResponseUtil;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.ProjectApplyStatus;
import com.example.freelancer.module.Project.dto.ApplyProjectRequest;
import com.example.freelancer.module.Project.dto.ProjectApplicationCompanyItemResponse;
import com.example.freelancer.module.Project.dto.ProjectApplicationItemResponse;
import com.example.freelancer.module.Project.dto.ProjectApplicationResponse;
import com.example.freelancer.module.Project.dto.ProjectMemberResponse;
import com.example.freelancer.module.Project.dto.UpdateApplicationStatusRequest;
import com.example.freelancer.module.Project.dto.UpdateApplicationStatusResponse;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectApplication;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectApplicationRepository;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.Project.service.interfaces.IProjectApplicationService;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;
import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.example.freelancer.module.freelancer.entity.TeamMember;
import com.example.freelancer.module.freelancer.repository.FreelancerRepository;
import com.example.freelancer.module.freelancer.repository.TeamMemberRepository;
import com.example.freelancer.module.notification.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectApplicationService implements IProjectApplicationService {
        private final ProjectApplicationRepository projectApplicationRepository;
        private final ProjectRepository projectRepository;
        private final FreelancerRepository freelancerRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final NotificationService notificationService;

        @Override
        @Transactional
        public ProjectApplicationResponse applyProject(ApplyProjectRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Freelancer freelancer = freelancerRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Freelancer not found"));

                Project project = projectRepository.findById(request.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                // BUSINESS RULE 1: project must be OPEN
                if (project.getApplyStatus() == ProjectApplyStatus.CLOSED) {
                        throw new BadRequestException("400", "Dự án đã đóng, không thể ứng tuyển");
                }

                // BUSINESS RULE 2: check duplicate apply
                boolean existed = projectApplicationRepository
                                .existsByProjectIdAndFreelancerId(project.getId(), freelancer.getId());

                if (existed) {
                        throw new BadRequestException("400", "Bạn đã apply dự án này rồi");
                }

                // CREATE APPLICATION
                ProjectApplication application = new ProjectApplication();
                application.setProject(project);
                application.setFreelancer(freelancer);
                application.setStatus(ApprovalStatus.PENDING);
                application.setAppliedAt(OffsetDateTime.now());

                ProjectApplication saved = projectApplicationRepository.save(application);
                notificationService.createNotification(
                                freelancer.getUser(),
                                "Ứng tuyển thành công",
                                "Bạn đã đăng ký vào dự án \"" + project.getName() + "\" thành công",
                                NotificationType.PROJECT_APPLIED,
                                project.getId());
                return ProjectApplicationResponse.builder()
                                .applicationId(saved.getId())
                                .projectId(project.getId())
                                .freelancerId(freelancer.getId())
                                .status(application.getStatus())
                                .appliedAt(application.getAppliedAt())
                                .build();
        }

        @Override
        public PageResponse<ProjectApplicationItemResponse> getMyApplications(
                        ApprovalStatus status,
                        int page,
                        int pageSize) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Freelancer freelancer = freelancerRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Freelancer not found"));

                Pageable pageable = PageRequest.of(
                                page - 1,
                                pageSize,
                                Sort.by(Sort.Direction.DESC, "appliedAt"));

                Page<ProjectApplication> pageData = projectApplicationRepository.findMyApplications(
                                freelancer.getId(),
                                status,
                                pageable);

                Page<ProjectApplicationItemResponse> mapped = pageData.map(app ->

                ProjectApplicationItemResponse.builder()
                                .applicationId(app.getId())
                                .projectId(app.getProject().getId())
                                .projectName(app.getProject().getName())
                                .projectDescription(app.getProject().getDescription())
                                .projectStatus(app.getProject().getApplyStatus())
                                .budget(app.getProject().getBudget())
                                .company(
                                                CompanyInfoResponse.builder()
                                                                .companyId(app.getProject().getCompany().getId())
                                                                .companyName(app.getProject().getCompany()
                                                                                .getCompanyName())
                                                                .build())
                                .status(app.getStatus())
                                .progressStatus(app.getProject().getProgressStatus())
                                .deadline(app.getProject().getDeadline())
                                .appliedAt(app.getAppliedAt())
                                .build());

                return PageResponseUtil.from(mapped);
        }

        // danh sách ứng viên của 1 dự án, chỉ chủ dự án mới xem được
        @Override
        public PageResponse<ProjectApplicationCompanyItemResponse> getProjectApplications(
                        UUID projectId,
                        ApprovalStatus status,
                        int page,
                        int pageSize) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                // CHECK OWNER COMPANY
                if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException("403", "Bạn không có quyền xem ứng tuyển của dự án này");
                }

                Pageable pageable = PageRequest.of(
                                page - 1,
                                pageSize,
                                Sort.by(Sort.Direction.DESC, "appliedAt"));

                Page<ProjectApplication> pageData = projectApplicationRepository.findByProjectId(
                                projectId,
                                status,
                                pageable);

                Page<ProjectApplicationCompanyItemResponse> mapped = pageData.map(app ->

                ProjectApplicationCompanyItemResponse.builder()
                                .applicationId(app.getId())

                                .freelancerId(app.getFreelancer().getId())
                                .freelancerName(app.getFreelancer().getUser().getFullName())

                                .experience(app.getFreelancer().getExperience())
                                .programmingLanguages(app.getFreelancer().getProgrammingLanguages())
                                .portfolioLink(app.getFreelancer().getPortfolioLink())
                                .projectLinks(app.getFreelancer().getProjectLinks())
                                .status(app.getStatus())
                                .appliedAt(app.getAppliedAt())
                                .build());

                return PageResponseUtil.from(mapped);
        }

        @Override
        @Transactional
        public UpdateApplicationStatusResponse updateApplicationStatus(
                        UUID applicationId,
                        UpdateApplicationStatusRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                ProjectApplication application = projectApplicationRepository
                                .findById(applicationId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Application not found"));

                Project project = application.getProject();

                // CHECK OWNER
                if (!project.getCompany()
                                .getUser()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền xử lý ứng tuyển này");
                }

                // ONLY PENDING CAN UPDATE
                if (application.getStatus() != ApprovalStatus.PENDING) {

                        throw new BadRequestException(
                                        "400",
                                        "Ứng tuyển đã được xử lý trước đó");
                }

                // ONLY APPROVED / REJECTED
                if (request.getStatus() != ApprovalStatus.APPROVED
                                && request.getStatus() != ApprovalStatus.REJECTED) {

                        throw new BadRequestException(
                                        "400",
                                        "Status không hợp lệ");
                }

                // UPDATE APPLICATION STATUS
                application.setStatus(request.getStatus());

                // APPROVE FLOW
                if (request.getStatus() == ApprovalStatus.APPROVED) {

                        // CHECK DUPLICATE MEMBER
                        boolean existedMember = projectMemberRepository
                                        .existsByProjectIdAndFreelancerId(
                                                        project.getId(),
                                                        application.getFreelancer().getId());

                        if (existedMember) {

                                throw new BadRequestException(
                                                "400",
                                                "Freelancer đã là thành viên của dự án");
                        }

                        // CHECK LEADER
                        boolean hasLeader = projectMemberRepository
                                        .existsByProjectIdAndIsLeaderTrue(project.getId());

                        ProjectMember member = new ProjectMember();

                        member.setProject(project);
                        member.setFreelancer(application.getFreelancer());
                        member.setJoinedAt(OffsetDateTime.now());

                        // first approved member = leader
                        member.setLeader(!hasLeader);

                        projectMemberRepository.save(member);

                        // notification approve
                        notificationService.createNotification(
                                        application.getFreelancer().getUser(),
                                        "Ứng tuyển được chấp nhận",
                                        "Bạn đã được duyệt vào dự án \""
                                                        + project.getName()
                                                        + "\" thành công",
                                        NotificationType.APPLICATION_APPROVED,
                                        project.getId());
                } else {

                        // notification reject
                        notificationService.createNotification(
                                        application.getFreelancer().getUser(),
                                        "Ứng tuyển bị từ chối",
                                        "Bạn đã bị từ chối khỏi dự án \""
                                                        + project.getName()
                                                        + "\"",
                                        NotificationType.APPLICATION_REJECTED,
                                        project.getId());
                }

                projectApplicationRepository.save(application);

                return UpdateApplicationStatusResponse.builder()
                                .applicationId(application.getId())
                                .status(application.getStatus())
                                .build();
        }

        @Override
        @Transactional
        public void removeProjectMember(UUID projectId, UUID memberId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Project not found"));

                if (!project.getCompany()
                                .getUser()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền xóa thành viên dự án này");
                }

                ProjectMember projectMember = projectMemberRepository.findById(memberId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Project member not found"));

                if (!projectMember.getProject().getId().equals(projectId)) {
                        throw new BadRequestException(
                                        "400",
                                        "Thành viên không thuộc dự án này");
                }

                UUID freelancerId = projectMember.getFreelancer().getId();

                List<TeamMember> teamMembers = teamMemberRepository
                                .findByTeamProjectIdAndFreelancerId(projectId, freelancerId);

                for (TeamMember teamMember : teamMembers) {
                        boolean wasTeamLeader = Boolean.TRUE.equals(teamMember.getIsLeader());
                        UUID teamId = teamMember.getTeam().getId();

                        teamMemberRepository.delete(teamMember);

                        if (wasTeamLeader) {
                                List<TeamMember> remainingTeamMembers = teamMemberRepository.findByTeamId(teamId);

                                if (!remainingTeamMembers.isEmpty()) {
                                        TeamMember newLeader = remainingTeamMembers.get(0);
                                        newLeader.setIsLeader(true);
                                        teamMemberRepository.save(newLeader);
                                }
                        }
                }

                boolean wasProjectLeader = projectMember.isLeader();

                projectMemberRepository.delete(projectMember);

                if (wasProjectLeader) {
                        List<ProjectMember> remainingProjectMembers = projectMemberRepository.findByProjectId(projectId);

                        if (!remainingProjectMembers.isEmpty()) {
                                ProjectMember newProjectLeader = remainingProjectMembers.get(0);
                                newProjectLeader.setLeader(true);
                                projectMemberRepository.save(newProjectLeader);
                        }
                }
        }

        @Override
        public List<ProjectMemberResponse> getProjectMembers(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Project not found"));

                // Kiểm tra Role qua Authorities
                boolean isCompany = currentUser.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));
                boolean isFreelancer = currentUser.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_FREELANCER"));

                if (isCompany) {
                        // Nếu là Company, phải là chủ dự án
                        if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                                throw new BadRequestException("403", "Bạn không có quyền xem thành viên dự án này");
                        }
                } else if (isFreelancer) {
                        // Nếu là Freelancer, phải là thành viên trong dự án
                        Freelancer freelancer = freelancerRepository.findByUserId(currentUser.getId())
                                        .orElseThrow(() -> new ResourceNotFoundException("404", "Freelancer not found"));
                                        
                        boolean isMember = projectMemberRepository.existsByProjectIdAndFreelancerId(projectId, freelancer.getId());
                        if (!isMember) {
                                throw new BadRequestException("403", "Bạn không có quyền xem thành viên dự án này vì không thuộc dự án");
                        }
                } else {
                        throw new BadRequestException("403", "Bạn không có quyền truy cập");
                }

                List<ProjectMember> members = projectMemberRepository.findByProjectId(projectId);

                return members.stream()
                                .map(member -> ProjectMemberResponse.builder()
                                                .memberId(member.getId())
                                                .freelancerId(member.getFreelancer().getId())
                                                .freelancerName(
                                                                member.getFreelancer()
                                                                                .getUser()
                                                                                .getFullName())
                                                .isLeader(member.isLeader())
                                                .joinedAt(member.getJoinedAt())
                                                .build())
                                .toList();
        }
}
