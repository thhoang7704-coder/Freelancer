package com.example.freelancer.module.freelancer.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.UserRole;
import com.example.freelancer.module.Project.dto.UpdateProjectProgressRequest;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.freelancer.dto.CreateFreelancerRequest;
import com.example.freelancer.module.freelancer.dto.FreelancerMapper;
import com.example.freelancer.module.freelancer.dto.FreelancerResponse;
import com.example.freelancer.module.freelancer.dto.UpdateFreelancerRequest;
import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.example.freelancer.module.freelancer.repository.FreelancerRepository;
import com.example.freelancer.module.freelancer.service.interfaces.IFreelancerService;
import com.example.freelancer.module.notification.service.NotificationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class FreelancerService implements IFreelancerService {
    private final FreelancerRepository freelancerRepository;
    private final UserRepository userRepository;
    private final FreelancerMapper freelancerMapper;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public FreelancerResponse createFreelancer(
            CreateFreelancerRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("400", "User not found"));

        if (user.getRole() != UserRole.USER) {
            throw new BadRequestException("400",
                    "Tài khoản đã đăng ký role khác");
        }

        boolean exists = freelancerRepository.existsByUserId(user.getId());

        if (exists) {
            throw new BadRequestException("400",
                    "Freelancer profile already exists");
        }

        Freelancer freelancer = Freelancer.builder()
                .user(user)
                .experience(request.getExperience())
                .projectLinks(request.getProjectLinks())
                .programmingLanguages(request.getProgrammingLanguages())
                .certificates(request.getCertificates())
                .portfolioLink(request.getPortfolioLink())
                .avatarUrl(request.getAvatarUrl())
                .build();

        freelancerRepository.save(freelancer);

        // UPDATE ROLE
        user.setRole(UserRole.FREELANCER);

        userRepository.save(user);

        return freelancerMapper.toResponse(freelancer);
    }

    @Override
    public FreelancerResponse getFreelancerProfile(
            UUID freelancerId) {

        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404", "Freelancer not found"));

        return freelancerMapper.toResponse(freelancer);
    }

    @Override
    public FreelancerResponse getMyFreelancerProfile() {
        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("401", "Unauthorized");
        }

        Freelancer freelancer = freelancerRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404", "Freelancer profile not found"));

        return freelancerMapper.toResponse(freelancer);
    }

    @Override
    @Transactional
    public FreelancerResponse updateFreelancer(
            UpdateFreelancerRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        Freelancer freelancer = freelancerRepository
                .findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Freelancer profile not found"));

        if (request.getExperience() != null) {
            freelancer.setExperience(request.getExperience());
        }

        if (request.getProjectLinks() != null) {
            freelancer.setProjectLinks(request.getProjectLinks());
        }

        if (request.getProgrammingLanguages() != null) {
            freelancer.setProgrammingLanguages(
                    request.getProgrammingLanguages());
        }

        if (request.getCertificates() != null) {
            freelancer.setCertificates(request.getCertificates());
        }

        if (request.getPortfolioLink() != null) {
            freelancer.setPortfolioLink(request.getPortfolioLink());
        }

        if (request.getAvatarUrl() != null) {
            freelancer.setAvatarUrl(request.getAvatarUrl());
        }

        freelancerRepository.save(freelancer);

        return freelancerMapper.toResponse(freelancer);
    }

    // chỉ leader mới được cập nhật tiến độ project
    @Override
    @Transactional
    public void updateProjectProgress(
            UUID projectId,
            UpdateProjectProgressRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Project not found"));

        // CHECK LEADER
        ProjectMember leader = projectMemberRepository
                .findByProjectIdAndFreelancerUserId(
                        projectId,
                        currentUser.getId())
                .orElseThrow(() -> new BadRequestException(
                        "403",
                        "Bạn không thuộc project"));

        if (!leader.isLeader()) {

            throw new BadRequestException(
                    "403",
                    "Chỉ leader mới được cập nhật tiến độ");
        }

        // VALIDATE STATUS
        if (request.getProgressStatus() == null) {

            throw new BadRequestException(
                    "400",
                    "ProgressStatus không được để trống");
        }

        // UPDATE PROJECT
        project.setProgressStatus(request.getProgressStatus());

        projectRepository.save(project);
        // notification cho company
        notificationService.createNotification(
                project.getCompany().getUser(),
                "Tiến độ dự án đã được cập nhật",
                "Leader đã cập nhật tiến độ dự án \""
                        + project.getName()
                        + "\" sang trạng thái "
                        + request.getProgressStatus().name(),
                NotificationType.PROJECT_PROGRESS_UPDATED,
                project.getId());
    }

}
