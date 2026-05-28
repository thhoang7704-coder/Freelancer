package com.example.freelancer.module.Project.repository;

import org.springframework.data.jpa.domain.Specification;

import com.example.freelancer.enums.ApprovalStatus;
import com.example.freelancer.enums.ProgressStatus;
import com.example.freelancer.module.Project.entity.Project;

public class ProjectSpecification {
    public static Specification<Project> hasStatus(
            ApprovalStatus status) {

        return (root, query, cb) -> status == null
                ? null
                : cb.equal(root.get("status"), status);
    }

    public static Specification<Project> hasProgressStatus(
            ProgressStatus progressStatus) {

        return (root, query, cb) -> progressStatus == null
                ? null
                : cb.equal(
                        root.get("progressStatus"),
                        progressStatus);
    }

    public static Specification<Project> searchByName(
            String keyword) {

        return (root, query, cb) -> keyword == null || keyword.isBlank()
                ? null
                : cb.like(
                        cb.lower(root.get("name")),
                        "%" + keyword.toLowerCase() + "%");
    }
}
