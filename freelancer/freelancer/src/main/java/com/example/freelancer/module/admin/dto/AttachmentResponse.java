package com.example.freelancer.module.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AttachmentResponse {

    private UUID id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private OffsetDateTime createdAt;
}
