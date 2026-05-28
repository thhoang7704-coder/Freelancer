package com.example.freelancer.module.auth.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.freelancer.User.User;
import com.example.freelancer.User.repository.UserRepository;
import com.example.freelancer.common.exception.BadRequestException;
import com.example.freelancer.common.exception.ConflictException;
import com.example.freelancer.common.exception.UnauthorizedException;
import com.example.freelancer.common.security.JwtUtil;
import com.example.freelancer.common.security.UserDetailsImpl;
import com.example.freelancer.enums.UserRole;
import com.example.freelancer.module.auth.dto.JwtResponse;
import com.example.freelancer.module.auth.dto.LoginRequest;
import com.example.freelancer.module.auth.dto.RegisterRequest;
import com.example.freelancer.module.auth.dto.TokenRefreshRequest;
import com.example.freelancer.module.auth.dto.TokenRefreshResponse;
import com.example.freelancer.module.auth.entity.RefreshToken;
import com.example.freelancer.module.auth.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "Email đã tồn tại trong hệ thống");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
            if (role == UserRole.ADMIN) {
                throw new BadRequestException("INVALID_ROLE", "Không thể tự đăng ký tài khoản ADMIN");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("INVALID_ROLE", "Role không hợp lệ");
        }

        // Tạo User
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .isActive(true)
                .build();

        user = userRepository.save(user);
        // Tạo Tokens
        String jwt = jwtUtil.generateJwtToken(user.getEmail(), user.getId(), user.getRole().name());
        RefreshToken newRefreshToken = createAndSaveRefreshToken(user);

        return buildJwtResponse(user, jwt, newRefreshToken.getTokenHash());
    }

    @Transactional
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UnauthorizedException("USER_NOT_FOUND", "Không tìm thấy user"));

        if (!user.isActive()) {
            throw new UnauthorizedException("ACCOUNT_BLOCKED", "Tài khoản của bạn đã bị khóa");
        }

        String jwt = jwtUtil.generateJwtToken(user.getEmail(), user.getId(), user.getRole().name());
        RefreshToken newRefreshToken = createAndSaveRefreshToken(user);

        return buildJwtResponse(user, jwt, newRefreshToken.getTokenHash());
    }

    @Transactional
    public TokenRefreshResponse refresh(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(requestRefreshToken)
                .orElseThrow(() -> new UnauthorizedException("REFRESH_TOKEN_NOT_FOUND", "Refresh token không tồn tại"));

        if (refreshToken.isRevoked()) {
            // Bảo mật: Nếu token đã bị revoke mà còn được dùng, có thể bị leak. Revoke toàn
            // bộ token của User.
            refreshTokenRepository.revokeAllUserTokens(refreshToken.getUser().getId());
            throw new UnauthorizedException("REFRESH_TOKEN_REVOKED", "Refresh token đã bị thu hồi");
        }

        if (refreshToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new UnauthorizedException("REFRESH_TOKEN_EXPIRED", "Refresh token đã hết hạn");
        }

        // Rotate token (Revoke token cũ, tạo token mới)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        String newJwt = jwtUtil.generateJwtToken(user.getEmail(), user.getId(), user.getRole().name());
        RefreshToken newRefreshToken = createAndSaveRefreshToken(user);

        return new TokenRefreshResponse(newJwt, newRefreshToken.getTokenHash());
    }

    @Transactional
    public void logout(TokenRefreshRequest request) {
        refreshTokenRepository.findByTokenHash(request.getRefreshToken())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private RefreshToken createAndSaveRefreshToken(User user) {
        String randomToken = UUID.randomUUID().toString();
        // Để đơn giản và an toàn, dùng chuỗi UUID ngẫu nhiên làm token,
        // ở bản thật thay vì 'tokenHash', có thể lưu mã băm của randomToken (SHA-256),
        // client cầm raw.
        // Ở code này, lấy luôn randomToken bỏ vào db cho gọn. Tính bảo mật ở đây có thể
        // update sau.

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(randomToken)
                .expiresAt(OffsetDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .isRevoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private JwtResponse buildJwtResponse(User user, String accessToken, String refreshToken) {
        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(JwtResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }
}
