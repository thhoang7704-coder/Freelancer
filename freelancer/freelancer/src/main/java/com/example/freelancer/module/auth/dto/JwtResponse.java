package com.example.freelancer.module.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Getter
@Setter
@Builder
@AllArgsConstructor
public class JwtResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    private UserDto user;

    @Data
    @Builder
    @AllArgsConstructor
    public static class UserDto {
        private UUID id;
        private String email;

        @JsonProperty("full_name")
        private String fullName;

        private String role;

        @JsonProperty("avatar_url")
        private String avatarUrl;
    }
}
