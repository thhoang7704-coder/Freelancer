package com.example.freelancer.module.report.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.enums.FeedbackType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FeedbackItem {
    private UUID id;
    private String authorName;
    private FeedbackType type;
    private String content;
    private String fileUrl;
    private OffsetDateTime createdAt;
}
