package com.example.freelancer.module.company.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.enums.ProjectApplyStatus;
import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.UserRole;
import com.example.freelancer.module.Payment.dto.PaymentDistributionResponse;
import com.example.freelancer.module.Payment.dto.PaymentLogResponse;
import com.example.freelancer.module.Payment.entity.Payment;
import com.example.freelancer.module.Payment.entity.PaymentDistribution;
import com.example.freelancer.module.Payment.entity.PaymentLog;
import com.example.freelancer.module.Payment.repository.PaymentLogRepository;
import com.example.freelancer.module.Payment.repository.PaymentRepository;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectApplicationRepository;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.company.dto.CompanyDetailResponse;
import com.example.freelancer.module.company.dto.CompanyMapper;
import com.example.freelancer.module.company.dto.CompanyPaymentResponse;
import com.example.freelancer.module.company.dto.CompanyProjectResponse;
import com.example.freelancer.module.company.dto.CompanyResponse;
import com.example.freelancer.module.company.dto.CreateCompanyRequest;
import com.example.freelancer.module.company.dto.UpdateCompanyRequest;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.company.repository.CompanyRepository;
import com.example.freelancer.module.company.service.interfaces.ICompanyService;
import com.example.freelancer.module.freelancer.dto.SetLeaderRequest;
import com.example.freelancer.module.freelancer.entity.Team;
import com.example.freelancer.module.freelancer.entity.TeamMember;
import com.example.freelancer.module.freelancer.repository.TeamMemberRepository;
import com.example.freelancer.module.freelancer.repository.TeamRepository;
import com.example.freelancer.module.notification.service.NotificationService;
import com.example.freelancer.module.task.repository.TaskRepository;
import com.example.freelancer.module.transaction.dto.PaymentTransactionResponse;
import com.example.freelancer.module.transaction.repository.PaymentDistributionRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompanyService implements ICompanyService {

        private final CompanyRepository companyRepository;
        private final UserRepository userRepository;
        private final CompanyMapper companyMapper;
        private final ProjectRepository projectRepository;
        private final TeamRepository teamRepository;
        private final TeamMemberRepository teamMemberRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final TaskRepository taskRepository;
        private final PaymentRepository paymentRepository;
        private final PaymentDistributionRepository distributionRepository;
        private final PaymentLogRepository paymentLogRepository;
        private final NotificationService notificationService;
        private final ProjectApplicationRepository projectApplicationRepository;

        @Override
        @Transactional
        public CompanyResponse createCompany(
                        CreateCompanyRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                User user = userRepository
                                .findById(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("404",
                                                "User not found"));

                // chỉ USER mới đăng ký company
                if (user.getRole() != UserRole.USER) {
                        throw new BadRequestException(
                                        "400",
                                        "Tài khoản không hợp lệ");
                }

                boolean existsCompany = companyRepository.existsByUserId(
                                user.getId());

                if (existsCompany) {
                        throw new BadRequestException(
                                        "400",
                                        "Bạn đã tạo company profile");
                }

                boolean taxCodeExists = companyRepository.existsByTaxCode(
                                request.getTaxCode());

                if (taxCodeExists) {
                        throw new BadRequestException(
                                        "400",
                                        "Mã số thuế đã tồn tại");
                }

                Company company = Company.builder()
                                .user(user)
                                .companyName(request.getCompanyName())
                                .address(request.getAddress())
                                .taxCode(request.getTaxCode())
                                .expertise(request.getExpertise())
                                .representativeName(
                                                request.getRepresentativeName())
                                .representativePhone(
                                                request.getRepresentativePhone())
                                .status(ApprovalStatus.PENDING)
                                .build();

                companyRepository.save(company);

                // đổi role sang COMPANY
                user.setRole(UserRole.COMPANY);

                userRepository.save(user);

                return companyMapper.toResponse(company);
        }

        @Override
        public CompanyDetailResponse getCompanyProfile(
                        UUID companyId) {

                Company company = companyRepository
                                .findById(companyId)
                                .orElseThrow(() -> new ResourceNotFoundException("404",
                                                "Company not found"));

                return companyMapper.toDetailResponse(company);
        }

        @Override
        public CompanyDetailResponse getMyCompanyProfile() {
                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
                Company company = companyRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Company not found"));
                return companyMapper.toDetailResponse(company);
        }

        @Override
        @Transactional
        public void updateMyCompany(
                        UpdateCompanyRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Company company = companyRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Company not found"));

                if (request.getCompanyName() != null) {
                        company.setCompanyName(request.getCompanyName());
                }

                if (request.getAddress() != null) {
                        company.setAddress(request.getAddress());
                }

                if (request.getRepresentativeName() != null) {
                        company.setRepresentativeName(request.getRepresentativeName());
                }

                if (request.getRepresentativePhone() != null) {
                        company.setRepresentativePhone(request.getRepresentativePhone());
                }
                if (request.getExpertise() != null) {
                        company.setExpertise(request.getExpertise());
                }

                companyRepository.save(company);
        }

        @Override
        @Transactional
        public void lockProject(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException("403", "Bạn không có quyền khóa dự án này");
                }

                if (project.getApplyStatus() == ProjectApplyStatus.CLOSED) {
                        throw new BadRequestException("400", "Dự án đã bị khóa rồi");
                }

                project.setApplyStatus(ProjectApplyStatus.CLOSED);

                projectRepository.save(project);
        }

        @Override
        @Transactional
        public void unlockProject(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                // check owner company
                if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException("403", "Bạn không có quyền mở khóa dự án này");
                }

                // business rule: nếu đã mở rồi thì không cần mở nữa
                if (project.getApplyStatus() == ProjectApplyStatus.OPEN) {
                        throw new BadRequestException("400", "Dự án đang ở trạng thái mở rồi");
                }

                // mở khóa
                project.setApplyStatus(ProjectApplyStatus.OPEN);

                projectRepository.save(project);
        }

        // set leader cho team, chỉ company owner mới được set leader, freelancer phải
        // thuộc team đó
        @Override
        @Transactional
        public void setLeader(
                        UUID teamId,
                        SetLeaderRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Team team = teamRepository.findById(teamId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Team not found"));

                // check owner
                if (!team.getProject()
                                .getCompany()
                                .getUser()
                                .getId()
                                .equals(currentUser.getId())) {

                        throw new BadRequestException(
                                        "403",
                                        "Bạn không có quyền set leader");
                }

                // freelancer must belong to team
                TeamMember newLeader = teamMemberRepository
                                .findByTeamIdAndFreelancerId(
                                                teamId,
                                                request.getFreelancerId())
                                .orElseThrow(() -> new BadRequestException(
                                                "400",
                                                "Freelancer không thuộc team"));

                // reset all leaders
                List<TeamMember> members = teamMemberRepository.findByTeamId(teamId);

                for (TeamMember member : members) {
                        boolean isNewLeader = member.getId().equals(newLeader.getId());

                        member.setIsLeader(isNewLeader);

                        // UPDATE PROJECT MEMBERS

                        ProjectMember projectMember = projectMemberRepository
                                        .findByProjectIdAndFreelancerId(
                                                        team.getProject().getId(),
                                                        member.getFreelancer().getId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "404",
                                                        "Project member not found"));

                        projectMember.setLeader(isNewLeader);

                        projectMemberRepository.save(projectMember);
                }

                teamMemberRepository.saveAll(members);
                List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(
                                team.getProject().getId());

                for (ProjectMember projectMember : projectMembers) {

                        projectMember.setLeader(
                                        projectMember.getFreelancer()
                                                        .getId()
                                                        .equals(request.getFreelancerId()));
                }

                projectMemberRepository.saveAll(projectMembers);
                // notification cho leader mới
                notificationService.createNotification(
                                newLeader.getFreelancer().getUser(),
                                "Bạn đã được chọn làm leader",
                                "Bạn đã được chọn làm leader trong dự án \""
                                                + team.getProject().getName()
                                                + "\" của công ty \""
                                                + team.getProject().getCompany().getCompanyName()
                                                + "\"",
                                NotificationType.LEADER_ASSIGNED,
                                team.getProject().getId());
        }

        @Override
        public List<CompanyProjectResponse> getCompanyProjects() {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();
                Company company = companyRepository.findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Company not found"));

                List<Project> projects = projectRepository
                                .findByCompanyUserId(currentUser.getId());
                List<Payment> allPayments = paymentRepository
                                .findByCompanyIdOrderByCreatedAtDesc(company.getId());
                // Tạo Map: projectId từ đó lấy PaymentStatus (lấy payment mới nhất)
                Map<UUID, PaymentStatus> paymentStatusMap = new HashMap<>();
                for (Payment p : allPayments) {
                        // putIfAbsent vì list đã sort desc → cái đầu tiên là mới nhất
                        paymentStatusMap.putIfAbsent(p.getProject().getId(), p.getPaymentStatus());
                }

                return projects.stream()
                                .map(project -> {

                                        int total = (int) taskRepository.countByProjectId(project.getId());
                                        int done = (int) taskRepository.countByProjectIdAndStatus(
                                                        project.getId(),
                                                        TaskStatus.DONE);

                                        int inProgress = (int) taskRepository.countByProjectIdAndStatus(
                                                        project.getId(),
                                                        TaskStatus.IN_PROGRESS);

                                        int todo = (int) taskRepository.countByProjectIdAndStatus(
                                                        project.getId(),
                                                        TaskStatus.TODO);
                                        int appliedCount = (int) projectApplicationRepository
                                                        .countByProjectId(project.getId());

                                        int acceptedCount = (int) projectApplicationRepository
                                                        .countByProjectIdAndStatus(
                                                                        project.getId(),
                                                                        ApprovalStatus.APPROVED);
                                        PaymentStatus paymentStatus = paymentStatusMap
                                                        .getOrDefault(project.getId(), PaymentStatus.UNPAID);

                                        return CompanyProjectResponse.builder()
                                                        .projectId(project.getId())
                                                        .projectName(project.getName())
                                                        .description(project.getDescription())
                                                        .progressStatus(project.getProgressStatus())
                                                        .budget(project.getBudget())
                                                        .status(project.getStatus())
                                                        .deadline(project.getDeadline())
                                                        .appliedCount(appliedCount)
                                                        .acceptedCount(acceptedCount)
                                                        .skillsRequired(
                                                                        project.getSkillsRequired() != null
                                                                                        ? List.of(
                                                                                                        project.getSkillsRequired()
                                                                                                                        .split("\\s*,\\s*"))
                                                                                        : List.of())
                                                        .applyStatus(project.getApplyStatus())
                                                        .progressStatus(project.getProgressStatus())
                                                        .totalTasks(total)
                                                        .doneTasks(done)
                                                        .inProgressTasks(inProgress)
                                                        .todoTasks(todo)
                                                        .createdAt(project.getCreatedAt())
                                                        .paymentStatus(paymentStatus)
                                                        .build();
                                })
                                .toList();
        }

        // lấy thanh toán dự án của từng công ty
        @Override
        public List<CompanyPaymentResponse> getMyPayments() {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                UUID userId = userDetails.getId();

                Company company = companyRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Company not found"));

                List<Payment> payments = paymentRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId());

                return payments.stream()
                                .map(payment -> {

                                        List<PaymentDistribution> distributions = distributionRepository
                                                        .findByPaymentId(payment.getId());

                                        List<PaymentLog> logs = paymentLogRepository.findByPaymentId(payment.getId());

                                        return CompanyPaymentResponse.builder()
                                                        .paymentId(payment.getId())
                                                        .paymentCode(payment.getPaymentCode())

                                                        .projectId(payment.getProject().getId())
                                                        .projectTitle(payment.getProject().getName())

                                                        .totalAmount(payment.getTotalAmount())

                                                        .paymentStatus(payment.getPaymentStatus())

                                                        .txnRef(payment.getTxnRef())

                                                        .adminPercent(payment.getAdminPercent())
                                                        .leaderPercent(payment.getLeaderPercent())

                                                        .createdAt(payment.getCreatedAt())

                                                        .transaction(
                                                                        payment.getTransaction() == null
                                                                                        ? null
                                                                                        : PaymentTransactionResponse
                                                                                                        .builder()
                                                                                                        .vnpayTransactionCode(
                                                                                                                        payment.getTransaction()
                                                                                                                                        .getVnpayTransactionCode())
                                                                                                        .status(
                                                                                                                        payment.getTransaction()
                                                                                                                                        .getStatus())
                                                                                                        .responseCode(
                                                                                                                        payment.getTransaction()
                                                                                                                                        .getResponseCode())
                                                                                                        .bankCode(
                                                                                                                        payment.getTransaction()
                                                                                                                                        .getBankCode())
                                                                                                        .build())

                                                        .distributions(
                                                                        distributions.stream()
                                                                                        .map(distribution -> PaymentDistributionResponse
                                                                                                        .builder()
                                                                                                        .freelancerId(
                                                                                                                        distribution.getFreelancer()
                                                                                                                                        .getId())
                                                                                                        .freelancerName(
                                                                                                                        distribution.getFreelancer()
                                                                                                                                        .getUser()
                                                                                                                                        .getFullName())
                                                                                                        .amount(distribution
                                                                                                                        .getAmount())
                                                                                                        .isLeader(distribution
                                                                                                                        .isLeader())
                                                                                                        .build())
                                                                                        .toList())

                                                        .logs(
                                                                        logs.stream()
                                                                                        .map(log -> PaymentLogResponse
                                                                                                        .builder()
                                                                                                        .vnpayTransactionCode(
                                                                                                                        log.getVnpayTransactionCode())
                                                                                                        .status(log.getStatus())
                                                                                                        .rawResponse(log.getRawResponse())
                                                                                                        .build())
                                                                                        .toList())

                                                        .build();
                                })
                                .toList();
        }
}