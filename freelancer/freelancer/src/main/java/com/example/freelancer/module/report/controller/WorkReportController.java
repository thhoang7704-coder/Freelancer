package com.example.freelancer.module.report.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.freelancer.module.report.dto.WorkReportResponse;
import com.example.freelancer.module.report.service.WorkReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class WorkReportController {
    private final WorkReportService workReportService;

    // Nộp báo cáo
    @PostMapping(value = "/{taskId}/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<WorkReportResponse> submitReport(
            @PathVariable UUID taskId,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        WorkReportResponse response = workReportService.submitReport(taskId, content, file);
        return ResponseEntity.ok(response);
    }

    // Xem list báo cáo của Task
    @GetMapping("/{taskId}/reports")
    public ResponseEntity<List<WorkReportResponse>> getReportsByTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(workReportService.getReportsByTask(taskId));
    }
}
