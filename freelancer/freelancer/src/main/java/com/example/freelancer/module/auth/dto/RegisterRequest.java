package com.example.freelancer.module.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Password không được để trống")
    // min 8, 1 hoa, 1 số
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[A-Z]).{8,}$", message = "Password phải từ 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ số")
    private String password;

    @NotBlank(message = "Full name không được để trống")
    private String fullName;

    private String phone;

    @NotBlank(message = "Role không được để trống")
    @Pattern(regexp = "^(USER|FREELANCER|COMPANY)$", message = "Role phải là USER, FREELANCER hoặc COMPANY")
    private String role;
}
