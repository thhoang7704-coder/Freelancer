package com.example.freelancer.module.notification.dto;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSendCompanyNotificationRequest {

    private UUID companyId;

    private String title;

    private String content;
}