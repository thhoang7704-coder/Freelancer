package com.example.freelancer.User.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.freelancer.User.User;
import com.example.freelancer.enums.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByIsActiveTrue();

    List<User> findByRole(UserRole role);

    List<User> findByIdIn(List<UUID> ids);

    long countByIsActiveTrue();

    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String fullName, String email);

    Optional<User> findFirstByRole(UserRole role);

    Page<User> findAll(Pageable pageable);
}
