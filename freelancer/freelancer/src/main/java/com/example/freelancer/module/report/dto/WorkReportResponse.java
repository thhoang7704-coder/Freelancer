package com.example.freelancer.module.report.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkReportResponse {
    private UUID id;
    private UUID taskId;
    private String reporterName;
    private String content;
    private String fileUrl;

    private OffsetDateTime reportedAt;

}