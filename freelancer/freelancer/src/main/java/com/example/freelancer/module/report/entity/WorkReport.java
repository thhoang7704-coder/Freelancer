package com.example.freelancer.module.report.entity;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.example.freelancer.module.task.entity.Task;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private Freelancer reporter;
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;
    @CreationTimestamp
    @Column(name = "reported_at", updatable = false)
    private OffsetDateTime reportedAt;

}
