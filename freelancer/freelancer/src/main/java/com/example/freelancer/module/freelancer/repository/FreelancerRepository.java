package com.example.freelancer.module.freelancer.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.freelancer.entity.Freelancer;

@Repository
public interface FreelancerRepository extends JpaRepository<Freelancer, UUID> {
    boolean existsByUserId(UUID userId);
    Optional<Freelancer> findByUserId(UUID userId);
}
