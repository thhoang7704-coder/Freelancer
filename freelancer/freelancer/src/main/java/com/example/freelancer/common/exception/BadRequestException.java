package com.example.freelancer.common.exception;

import org.springframework.http.HttpStatus;

// ─── 400 Bad Request ─────────────────────────────────────────────────────────

public class BadRequestException extends DomainException {
    public BadRequestException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.BAD_REQUEST);
    }
}