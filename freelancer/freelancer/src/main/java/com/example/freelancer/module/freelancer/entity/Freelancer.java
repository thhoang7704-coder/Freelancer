package com.example.freelancer.module.freelancer.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.freelancer.User.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "freelancers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Freelancer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "experience", nullable = true)
    private String experience;
    @Column(name = "project_links", nullable = true)
    private String projectLinks;
    @Column(name = "programming_languages", nullable = true)
    private String programmingLanguages;
    @Column(name = "certificates", nullable = true)
    private String certificates;
    @Column(name = "portfolio_link", nullable = true)
    private String portfolioLink;
    @Column(name = "avatar_url", nullable = true)
    private String avatarUrl;
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private OffsetDateTime createdAt;
}
