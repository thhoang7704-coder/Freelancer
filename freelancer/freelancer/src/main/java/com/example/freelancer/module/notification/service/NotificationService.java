package com.example.freelancer.module.notification.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ResourceNotFoundException;
import com.example.freelancer.common.security.SecurityUtils;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.NotificationType;
import com.example.freelancer.module.company.entity.Company;
import com.example.freelancer.module.company.repository.CompanyRepository;
import com.example.freelancer.module.notification.dto.AdminSendCompanyNotificationRequest;
import com.example.freelancer.module.notification.dto.NotificationResponse;
import com.example.freelancer.module.notification.enitity.Notification;
import com.example.freelancer.module.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CompanyRepository companyRepository;

    public void createNotification(
            User user,
            String title,
            String content,
            NotificationType type,
            UUID referenceId) {

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional
    public NotificationResponse sendNotificationToCompany(
            AdminSendCompanyNotificationRequest request) {

        UserDetailsImpl currentUser = SecurityUtils.getCurrentUser();

        // CHECK ADMIN
        if (!currentUser.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {

            throw new BadRequestException(
                    "403",
                    "Bạn không có quyền gửi thông báo");
        }

        Company company = companyRepository
                .findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "404",
                        "Company not found"));

        Notification notification = Notification.builder()
                .user(company.getUser())
                .title(request.getTitle())
                .content(request.getContent())
                .type(NotificationType.ADMIN_MESSAGE)
                .isRead(false)
                .referenceId(company.getId())
                .build();

        Notification saved = notificationRepository.save(notification);

        return NotificationResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .content(saved.getContent())
                .type(saved.getType())
                .isRead(saved.isRead())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}