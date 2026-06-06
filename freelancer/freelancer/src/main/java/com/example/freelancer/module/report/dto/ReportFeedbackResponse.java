package com.example.freelancer.module.report.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.example.freelancer.enums.FeedbackType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportFeedbackResponse {
    private UUID id;
    private String authorName; // Tên của Leader hoặc Công ty
    private String authorAvatar; // Avatar (tùy chọn)
    private FeedbackType type;
    private String content;
    private String fileUrl;
    private OffsetDateTime createdAt;
}
