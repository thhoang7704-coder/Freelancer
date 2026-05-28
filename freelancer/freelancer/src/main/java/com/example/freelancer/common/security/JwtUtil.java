package com.example.freelancer.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration-ms}")
    private long jwtExpirationMs;

    @Value("${jwt.qr-token-expiration-seconds}")
    private long qrTokenExpirationSeconds;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(
                // fallback encode base64 neu config la text thuong
                java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes())));
    }

    public String generateJwtToken(String email, UUID userId, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    /**
     * Generate a short-lived QR token (60s) for check-in.
     * Claims: sub=email, userId, role, type=QR_CHECKIN, jti=unique token id (used
     * as Redis key)
     */
    public String generateQrToken(String email, UUID userId, String role) {
        String jti = UUID.randomUUID().toString();
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .claim("role", role)
                .claim("type", "QR_CHECKIN")
                .id(jti) // jti = JWT ID, dùng làm Redis key
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + qrTokenExpirationSeconds * 1000))
                .signWith(key())
                .compact();
    }

    public long getQrTokenExpirationSeconds() {
        return qrTokenExpirationSeconds;
    }

    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmailFromJwtToken(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public static Optional<String> getCurrentUserId() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        return Optional.ofNullable(extractPrincipal(securityContext.getAuthentication()));
    }

    private static String extractPrincipal(Authentication authentication) {
        if (authentication == null) {
            return null;
        } else if (authentication.getPrincipal() instanceof UserDetailsImpl customUser) {
            return customUser.getId().toString();
        } else if (authentication.getPrincipal() instanceof UserDetails springSecurityUser) {
            return springSecurityUser.getUsername();
        } else if (authentication.getPrincipal() instanceof String s) {
            return "anonymousUser".equals(s) ? null : s;
        }
        return null;
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT validation error: {}", e.getMessage());
        }
        return false;
    }
}