package com.example.freelancer.module.Project.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.Project.entity.ProjectAttachment;

@Repository
public interface ProjectAttachmentRepository extends JpaRepository<ProjectAttachment, UUID> {

}
