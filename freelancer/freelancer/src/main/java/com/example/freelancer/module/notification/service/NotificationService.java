package com.example.freelancer.module.notification.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
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
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final CompanyRepository companyRepository;
        private final UserRepository userRepository;

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

        @Async("notificationExecutor")
        @Transactional
        public void sendToAllAdminsAsync(String title, String content) {
                try {
                        // Send to all active users (previously this targeted only ADMIN role)
                        List<User> recipients = userRepository.findByIsActiveTrue();
                        if (recipients == null || recipients.isEmpty()) {
                                log.info("No active users found to send notification.");
                                return;
                        }

                        // Nếu recipient rất nhiều, có thể chunk để tránh OOM / transaction quá lớn:
                        final int CHUNK = 100;
                        List<List<User>> batches = partition(recipients, CHUNK);

                        for (List<User> batch : batches) {
                                for (User user : batch) {
                                        try {
                                                // Gọi createNotification (sẽ lưu vào DB)
                                                createNotification(
                                                                user,
                                                                title,
                                                                content,
                                                                NotificationType.ADMIN_MESSAGE,
                                                                null);
                                        } catch (Exception e) {
                                                log.error("Failed to create notification for user {}: {}",
                                                                user.getId(), e.getMessage(), e);
                                                // tiếp tục các recipient khác
                                        }
                                }
                                // nếu muốn: Thread.sleep(50) để giảm áp lực DB (tùy case)
                        }

                        log.info("Broadcast to all users completed. totalRecipients={}", recipients.size());
                } catch (Exception ex) {
                        log.error("Unexpected error while broadcasting to users: {}", ex.getMessage(), ex);
                }
        }

        private static <T> List<List<T>> partition(List<T> list, int size) {
                int full = (list.size() + size - 1) / size;
                return java.util.stream.IntStream.range(0, full)
                                .mapToObj(i -> list.subList(i * size, Math.min((i + 1) * size, list.size())))
                                .collect(Collectors.toList());
        }
}