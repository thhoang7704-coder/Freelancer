package com.example.freelancer.module.admin.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.common.response.PageResponseUtil;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.ProjectApplyStatus;
import com.example.freelancer.enums.UserRole;
import com.example.freelancer.module.Payment.entity.Payment;
import com.example.freelancer.module.Payment.repository.PaymentRepository;
import com.example.freelancer.module.Project.dto.ProjectItemResponse;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.repository.ProjectApplicationRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.admin.dto.AttachmentResponse;
import com.example.freelancer.module.admin.dto.CompanyStatusResponse;
import com.example.freelancer.module.admin.dto.PaymentResponse;
import com.example.freelancer.module.admin.dto.PendingCompanyResponse;
import com.example.freelancer.module.admin.dto.PendingProjectResponse;
import com.example.freelancer.module.admin.dto.UpdateCompanyStatusRequest;
import com.example.freelancer.module.admin.dto.UpdateProjectStatusRequest;
import com.example.freelancer.module.admin.dto.UpdateProjectStatusResponse;
import com.example.freelancer.module.admin.service.interfaces.IAdminService;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;
import com.example.freelancer.module.company.dto.CompanyResponse;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.company.repository.CompanyRepository;
import com.example.freelancer.module.notification.service.NotificationService;
import com.example.freelancer.module.transaction.entity.PaymentTransaction;
import com.google.auto.value.AutoValue.Builder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Builder
public class AdminService implements IAdminService {

        private final CompanyRepository companyRepository;
        private final UserRepository userRepository;
        private final ProjectRepository projectRepository;
        private final NotificationService notificationService;
        private final ProjectApplicationRepository projectApplicationRepository;
        private final PaymentRepository paymentRepository;

        @Override
        public PageResponse<PendingCompanyResponse> getPendingCompanies(
                        int page,
                        int pageSize) {

                Pageable pageable = PageRequest.of(
                                page - 1,
                                pageSize,
                                Sort.by(Sort.Direction.DESC, "createdAt"));

                Page<Company> companyPage = companyRepository.findByStatus(
                                ApprovalStatus.PENDING,
                                pageable);

                Page<PendingCompanyResponse> responsePage = companyPage.map(company -> PendingCompanyResponse.builder()
                                .companyId(company.getId())
                                .companyName(company.getCompanyName())
                                .taxCode(company.getTaxCode())
                                .representativeName(company.getRepresentativeName())
                                .representativePhone(company.getRepresentativePhone())
                                .status(company.getStatus())
                                .createdAt(company.getCreatedAt())
                                .build());

                return PageResponseUtil.from(responsePage);
        }

        // duyệt hoặc từ chối công ty, chỉ admin mới được duyệt hoặc từ chối
        @Override
        @Transactional
        public CompanyStatusResponse updateCompanyStatus(
                        UUID companyId,
                        UpdateCompanyStatusRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Company company = companyRepository.findById(companyId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Company not found"));

                // chỉ xử lý APPROVED hoặc REJECTED
                if (request.getStatus() != ApprovalStatus.APPROVED
                                && request.getStatus() != ApprovalStatus.REJECTED) {

                        throw new BadRequestException(
                                        "400",
                                        "Status không hợp lệ");
                }

                // update status
                company.setStatus(request.getStatus());
                company.setApprovedAt(OffsetDateTime.now());
                company.setApprovedBy(currentUser.getId());

                companyRepository.save(company);

                // APPROVED -> đổi role USER -> COMPANY
                if (request.getStatus() == ApprovalStatus.APPROVED) {

                        User user = company.getUser();

                        user.setRole(UserRole.COMPANY);

                        userRepository.save(user);
                        // notification
                        notificationService.createNotification(
                                        user,
                                        "Công ty đã được duyệt",
                                        "Công ty của bạn đã được admin duyệt thành công",
                                        NotificationType.COMPANY_APPROVED,
                                        company.getId());
                } else {

                        // notification reject
                        notificationService.createNotification(
                                        company.getUser(),
                                        "Công ty bị từ chối",
                                        "Công ty của bạn đã bị admin từ chối",
                                        NotificationType.COMPANY_REJECTED,
                                        company.getId());
                }

                return CompanyStatusResponse.builder()
                                .companyId(company.getId())
                                .status(company.getStatus())
                                .build();
        }

        // lấy danh sách project đang chờ duyệt, chỉ admin mới được xem
        @Override
        @Transactional(readOnly = true)
        public PageResponse<PendingProjectResponse> getPendingProjects(
                        int page,
                        int pageSize) {

                Pageable pageable = PageRequest.of(
                                page - 1,
                                pageSize,
                                Sort.by(Sort.Direction.DESC, "createdAt"));

                Page<Project> projectPage = projectRepository.findByStatus(
                                ApprovalStatus.PENDING,
                                pageable);

                Page<PendingProjectResponse> responsePage = projectPage.map(project -> PendingProjectResponse.builder()
                                .projectId(project.getId())
                                .name(project.getName())
                                .budget(project.getBudget())
                                .description(project.getDescription())
                                .deadline(project.getDeadline())
                                .files(project.getAttachments().stream()
                                                .map(att -> att.getFileUrl())
                                                .toList())
                                .company(
                                                CompanyInfoResponse.builder()
                                                                .companyId(project.getCompany().getId())
                                                                .companyName(project.getCompany().getCompanyName())
                                                                .build())
                                .status(project.getStatus())
                                .createdAt(project.getCreatedAt())
                                .build());

                return PageResponseUtil.from(responsePage);
        }

        // duyệt hoặc từ chối project, chỉ admin mới được duyệt hoặc từ chối
        @Override
        @Transactional
        public UpdateProjectStatusResponse updateProjectStatus(
                        UUID projectId,
                        UpdateProjectStatusRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Project not found"));

                // chỉ xử lý project đang pending
                if (project.getStatus() != ApprovalStatus.PENDING) {
                        throw new BadRequestException(
                                        "400",
                                        "Dự án này đã được xử lý trước đó");
                }

                // chỉ cho APPROVED hoặc REJECTED
                if (request.getStatus() != ApprovalStatus.APPROVED
                                && request.getStatus() != ApprovalStatus.REJECTED) {

                        throw new BadRequestException(
                                        "400",
                                        "Status không hợp lệ");
                }

                project.setStatus(request.getStatus());
                project.setApprovedBy(currentUser.getId());
                project.setApprovedAt(OffsetDateTime.now());

                // nếu approve thì mở apply
                if (request.getStatus() == ApprovalStatus.APPROVED) {
                        project.setApplyStatus(ProjectApplyStatus.OPEN);
                        // notification approve
                        notificationService.createNotification(
                                        project.getCompany().getUser(),
                                        "Dự án đã được duyệt",
                                        "Dự án \"" + project.getName()
                                                        + "\" đã được admin duyệt thành công",
                                        NotificationType.PROJECT_APPROVED,
                                        project.getId());
                } else {
                        // notification reject
                        notificationService.createNotification(
                                        project.getCompany().getUser(),
                                        "Dự án bị từ chối",
                                        "Dự án \"" + project.getName()
                                                        + "\" đã bị admin từ chối",
                                        NotificationType.PROJECT_REJECTED,
                                        project.getId());
                }

                projectRepository.save(project);

                // TODO:
                // lưu notes vào bảng review_logs / admin_notes
                // gửi notification sau

                return UpdateProjectStatusResponse.builder()
                                .projectId(project.getId())
                                .status(project.getStatus())
                                .build();
        }

        @Override
        public List<CompanyResponse> getAllCompanies() {
                return companyRepository.getAllCompaniesWithProjectCount();
        }

        @Override
        @Transactional(readOnly = true)
        public List<ProjectItemResponse> getAllProjectsByAdmin() {
                List<Project> projects = projectRepository.findAll();

                return projects.stream()
                                .map(project -> ProjectItemResponse.builder()
                                                .projectId(project.getId())
                                                .name(project.getName())
                                                .budget(project.getBudget())
                                                .description(project.getDescription())
                                                .deadline(project.getDeadline())
                                                .description(project.getDescription())
                                                .appliedCount((int) projectApplicationRepository
                                                                .countByProjectId(project.getId()))
                                                .acceptedCount((int) projectApplicationRepository
                                                                .countByProjectIdAndStatus(
                                                                                project.getId(),
                                                                                ApprovalStatus.APPROVED))
                                                .attachments(
                                                                project.getAttachments()
                                                                                .stream()
                                                                                .map(att -> AttachmentResponse.builder()
                                                                                                .id(att.getId())
                                                                                                .fileName(att.getFileName())
                                                                                                .fileUrl(att.getFileUrl())
                                                                                                .fileType(att.getFileType())
                                                                                                .createdAt(att.getCreatedAt())
                                                                                                .build())
                                                                                .toList())
                                                .status(project.getStatus())
                                                .progressStatus(project.getProgressStatus())
                                                .paymentStatus(project.getPaymentStatus())
                                                .createdAt(project.getCreatedAt())
                                                .company(
                                                                CompanyInfoResponse.builder()
                                                                                .companyId(project.getCompany().getId())
                                                                                .companyName(project.getCompany()
                                                                                                .getCompanyName())
                                                                                .build())
                                                .build())
                                .toList();
        }

        @Override
        public List<PaymentResponse> getAllPayments() {

                List<Payment> payments = paymentRepository.findAll();

                List<PaymentResponse> responses = payments.stream()
                                .map(payment -> {

                                        PaymentTransaction transaction = payment.getTransaction();

                                        return PaymentResponse.builder()

                                                        // payment
                                                        .paymentId(payment.getId())
                                                        .paymentCode(payment.getPaymentCode())
                                                        .txnRef(payment.getTxnRef())
                                                        .totalAmount(payment.getTotalAmount())
                                                        .paymentStatus(payment.getPaymentStatus())
                                                        .adminPercent(payment.getAdminPercent())
                                                        .leaderPercent(payment.getLeaderPercent())
                                                        .createdAt(payment.getCreatedAt())

                                                        // project
                                                        .projectId(
                                                                        payment.getProject() != null
                                                                                        ? payment.getProject().getId()
                                                                                        : null)

                                                        .projectName(
                                                                        payment.getProject() != null
                                                                                        ? payment.getProject().getName()
                                                                                        : null)

                                                        // company
                                                        .companyId(
                                                                        payment.getCompany() != null
                                                                                        ? payment.getCompany().getId()
                                                                                        : null)

                                                        .companyName(
                                                                        payment.getCompany() != null
                                                                                        ? payment.getCompany()
                                                                                                        .getCompanyName()
                                                                                        : null)

                                                        // transaction
                                                        .paymentTransactionId(
                                                                        transaction != null
                                                                                        ? transaction.getId()
                                                                                        : null)

                                                        .vnpayTransactionCode(
                                                                        transaction != null
                                                                                        ? transaction.getVnpayTransactionCode()
                                                                                        : null)

                                                        .gatewayStatus(
                                                                        transaction != null
                                                                                        ? transaction.getStatus()
                                                                                        : null)

                                                        .responseCode(
                                                                        transaction != null
                                                                                        ? transaction.getResponseCode()
                                                                                        : null)

                                                        .bankCode(
                                                                        transaction != null
                                                                                        ? transaction.getBankCode()
                                                                                        : null)

                                                        .build();
                                })
                                .toList();

                return responses;
        }
}
