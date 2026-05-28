package com.example.freelancer.module.Project.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.response.PageResponse;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.enums.PaymentStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.enums.ProjectApplyStatus;
import com.example.freelancer.module.Project.dto.CreateProjectRequest;
import com.example.freelancer.module.Project.dto.ProjectItemResponse;
import com.example.freelancer.module.Project.dto.ProjectMapper;
import com.example.freelancer.module.Project.dto.ProjectResponse;
import com.example.freelancer.module.Project.dto.UpdateProjectRequest;
import com.example.freelancer.module.Project.entity.Project;
import com.example.freelancer.module.Project.entity.ProjectAttachment;
import com.example.freelancer.module.Project.entity.ProjectMember;
import com.example.freelancer.module.Project.repository.ProjectAttachmentRepository;
import com.example.freelancer.module.Project.repository.ProjectMemberRepository;
import com.example.freelancer.module.Project.repository.ProjectRepository;
import com.example.freelancer.module.Project.repository.ProjectSpecification;
import com.example.freelancer.module.Project.service.interfaces.IProjectService;
import com.example.freelancer.module.company.dto.CompanyInfoResponse;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.company.repository.CompanyRepository;
import com.example.freelancer.module.notification.service.NotificationService;
import com.example.freelancer.module.admin.dto.AttachmentResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService implements IProjectService {

        private final ProjectRepository projectRepository;
        private final CompanyRepository companyRepository;
        private final CloudinaryService cloudinaryService;
        private final ProjectAttachmentRepository attachmentRepository;
        private final NotificationService notificationService;
        private final ProjectMemberRepository projectMemberRepository;

        @Override
        @Transactional
        public ProjectResponse createProject(
                        CreateProjectRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Company company = companyRepository
                                .findByUserId(currentUser.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "404",
                                                "Company not found"));
                if (company.getStatus() != ApprovalStatus.APPROVED) {
                        throw new BadRequestException(
                                        "400",
                                        "Công ty chưa được duyệt");
                }

                Project project = Project.builder()
                                .company(company)
                                .name(request.getName())
                                .description(request.getDescription())
                                .budget(request.getBudget())
                                .deadline(request.getDeadline())
                                .skillsRequired(
                                                String.join(
                                                                ", ",
                                                                request.getSkillsRequired()))
                                .status(ApprovalStatus.PENDING)
                                .progressStatus(ProgressStatus.TODO)
                                .paymentStatus(PaymentStatus.UNPAID)
                                .applyStatus(ProjectApplyStatus.OPEN)
                                .build();

                projectRepository.save(project);
                // create notification
                notificationService.createNotification(
                                company.getUser(),
                                "Tạo dự án thành công",
                                "Bạn đã tạo dự án \"" + project.getName() + "\" thành công",
                                NotificationType.PROJECT_CREATED,
                                project.getId());
                // upload files
                List<String> fileUrls = new ArrayList<>();
                if (request.getFiles() != null &&
                                !request.getFiles().isEmpty()) {

                        for (MultipartFile file : request.getFiles()) {

                                String fileUrl = cloudinaryService.uploadFile(file);
                                fileUrls.add(fileUrl);
                                ProjectAttachment attachment = ProjectAttachment.builder()
                                                .project(project)
                                                .fileName(file.getOriginalFilename())
                                                .fileType(file.getContentType())
                                                .fileUrl(fileUrl)
                                                .build();

                                attachmentRepository.save(attachment);
                        }
                }

                return ProjectResponse.builder()
                                .projectId(project.getId())
                                .description(project.getDescription())
                                .deadline(project.getDeadline())
                                .name(project.getName())
                                .budget(project.getBudget())
                                .status(project.getStatus())
                                .files(fileUrls)
                                .progressStatus(project.getProgressStatus())
                                .paymentStatus(project.getPaymentStatus())
                                .createdAt(project.getCreatedAt())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public PageResponse<ProjectItemResponse> getAllProjects(
                        ApprovalStatus status,
                        ProgressStatus progressStatus,
                        String search,
                        int page,
                        int pageSize) {

                Pageable pageable = PageRequest.of(
                                page - 1,
                                pageSize,
                                Sort.by(Sort.Direction.DESC, "createdAt"));

                Specification<Project> spec = Specification.where(
                                ProjectSpecification.hasStatus(status))
                                .and(ProjectSpecification.hasProgressStatus(progressStatus))
                                .and(ProjectSpecification.searchByName(search));

                Page<Project> projectPage = projectRepository.findAll(spec, pageable);

                List<ProjectItemResponse> items = projectPage.getContent()
                                .stream()
                                .map(project -> ProjectItemResponse.builder()
                                                .projectId(project.getId())
                                                .name(project.getName())
                                                .description(project.getDescription())
                                                .budget(project.getBudget())
                                                .status(project.getStatus())
                                                .skillsRequired(project.getSkillsRequired())
                                                .deadline(project.getDeadline())
                                                .progressStatus(project.getProgressStatus())
                                                .paymentStatus(project.getPaymentStatus())
                                                .applyStatus(project.getApplyStatus())
                                                .company(
                                                                CompanyInfoResponse.builder()
                                                                                .companyId(project.getCompany().getId())
                                                                                .companyName(project.getCompany()
                                                                                                .getCompanyName())
                                                                                .build())
                                                .appliedCount(project.getApplications().size())
                                                .acceptedCount(
                                                                (int) project.getApplications()
                                                                                .stream()
                                                                                .filter(app -> app
                                                                                                .getStatus() == ApprovalStatus.APPROVED)
                                                                                .count())
                                                .createdAt(project.getCreatedAt())
                                                .attachments(project.getAttachments().stream().map(att -> AttachmentResponse.builder()
                                                                .id(att.getId())
                                                                .fileName(att.getFileName())
                                                                .fileUrl(att.getFileUrl())
                                                                .fileType(att.getFileType())
                                                                .createdAt(att.getCreatedAt())
                                                                .build()).toList())
                                                .build())
                                .toList();

                return PageResponse.<ProjectItemResponse>builder()
                                .items(items)
                                .pagination(PageResponse.PaginationMeta.builder()
                                                .page(page)
                                                .limit(pageSize)
                                                .total(projectPage.getTotalElements())
                                                .totalPages(projectPage.getTotalPages())
                                                .build())
                                .build();
        }

        @Override
        @Transactional
        public ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                // check owner
                if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException("403", "Bạn không có quyền cập nhật dự án này");
                }

                // BUSINESS RULE: nếu đã khóa thì không cho update
                if (project.getApplyStatus() == ProjectApplyStatus.CLOSED) {
                        throw new BadRequestException("400", "Dự án đã bị khóa, không thể cập nhật");
                }

                // BUSINESS RULE: nếu đang chạy thì hạn chế update (tuỳ bạn)
                if (project.getProgressStatus() == ProgressStatus.IN_PROGRESS) {
                        throw new BadRequestException("400", "Dự án đang thực hiện, không thể chỉnh sửa");
                }

                // update fields
                project.setName(request.getName());
                project.setDescription(request.getDescription());
                project.setBudget(request.getBudget());
                project.setDeadline(request.getDeadline());

                // skills (nếu lưu dạng list/string thì xử lý ở đây)
                // project.setSkillsRequired(...)

                projectRepository.save(project);
                // create notification for members
                List<ProjectMember> members = projectMemberRepository.findByProjectId(project.getId());
                for (ProjectMember member : members) {

                        notificationService.createNotification(
                                        member.getFreelancer().getUser(),
                                        "Dự án đã được cập nhật",
                                        "Dự án \"" + project.getName() + "\" đã được công ty cập nhật thông tin",
                                        NotificationType.PROJECT_UPDATED,
                                        project.getId());
                }
                return ProjectMapper.toResponse(project);
        }

        @Override
        @Transactional
        public void deleteProject(UUID projectId) {

                UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

                Project project = projectRepository.findById(projectId)
                                .orElseThrow(() -> new ResourceNotFoundException("404", "Project not found"));

                // OWNER CHECK
                if (!project.getCompany().getUser().getId().equals(currentUser.getId())) {
                        throw new BadRequestException("403", "Bạn không có quyền xóa dự án này");
                }

                // BUSINESS RULE: chỉ xóa khi PENDING
                if (project.getStatus() != ApprovalStatus.PENDING) {
                        throw new BadRequestException(
                                        "400",
                                        "Chỉ được xóa dự án khi đang ở trạng thái PENDING");
                }

                projectRepository.delete(project);
        }
}