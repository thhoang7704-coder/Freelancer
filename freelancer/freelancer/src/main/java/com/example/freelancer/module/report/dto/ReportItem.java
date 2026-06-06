package com.example.freelancer.module.report.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder

public class ReportItem {
    private UUID id;
    private String reporterName;
    private String content;
    private String fileUrl;
    private OffsetDateTime reportedAt;

    private List<FeedbackItem> feedbacks;
}