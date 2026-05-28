package com.example.freelancer.module.notification.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.NotificationType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {

    private UUID id;

    private String title;

    private String content;

    private NotificationType type;

    private boolean isRead;

    private UUID referenceId;

    private OffsetDateTime createdAt;
}