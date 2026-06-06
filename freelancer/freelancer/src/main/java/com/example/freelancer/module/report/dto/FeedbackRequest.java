package com.example.freelancer.module.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotBlank(message = "Nội dung feedback không được để trống")
    private String feedback;
    private String fileUrl;
}
