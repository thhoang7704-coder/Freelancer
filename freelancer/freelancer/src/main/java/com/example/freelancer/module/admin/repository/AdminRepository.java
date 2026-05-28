package com.example.freelancer.module.admin.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.freelancer.module.admin.entity.AdminProfile;

public interface AdminRepository extends JpaRepository<AdminProfile, UUID> {

}
