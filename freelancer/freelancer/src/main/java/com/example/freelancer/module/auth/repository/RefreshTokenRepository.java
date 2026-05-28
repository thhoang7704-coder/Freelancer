package com.example.freelancer.module.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.freelancer.module.auth.entity.RefreshToken;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // Xóa/revoke tất cả token cũ của user, không cho dùng nữa (khi rotate/logout
    // all/đổi pass)
    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true WHERE r.user.id = :userId AND r.isRevoked = false")
    void revokeAllUserTokens(UUID userId);

    // Auto cleanup worker if needed
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now")
    void deleteAllExpiredSince(OffsetDateTime now);
}