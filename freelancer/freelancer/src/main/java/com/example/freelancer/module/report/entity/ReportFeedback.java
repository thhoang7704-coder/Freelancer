package com.example.freelancer.module.report.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.User.User;
import com.example.freelancer.enums.FeedbackType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_feedbacks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    // Feedback này thuộc về báo cáo nào?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private WorkReport report;
    // Ai là người viết feedback này? (Lưu bảng User vì có thể là Công ty hoặc
    // Freelancer)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_type", nullable = false)
    private FeedbackType type;
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}