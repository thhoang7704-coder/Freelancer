package com.example.freelancer.module.company.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.freelancer.enums.TaskStatus;
import com.example.freelancer.enums.TaskType;
import com.example.freelancer.module.report.dto.ReportItem;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyProjectTaskResponse {

    private UUID taskId;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskType taskType;
    private String fileUrl;
    private UUID assignedTo;
    private String assignedToName;
    private OffsetDateTime deadline;
    private OffsetDateTime createdAt;

    // Danh sách báo cáo của task này
    private List<ReportItem> reports;

}
