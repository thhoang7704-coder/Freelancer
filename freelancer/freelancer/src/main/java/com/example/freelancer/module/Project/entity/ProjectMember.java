package com.example.freelancer.module.Project.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.freelancer.module.freelancer.entity.Freelancer;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "project_members")
@Getter
@Setter
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    @JsonProperty("isLeader")
    @Column(name = "is_leader")
    private Boolean leader;

    @Column(name = "joined_at")
    private OffsetDateTime joinedAt;

    // Helper method de tuong thich voi code cu dung .isLeader()
    public boolean isLeader() {
        return Boolean.TRUE.equals(this.leader);
    }
}