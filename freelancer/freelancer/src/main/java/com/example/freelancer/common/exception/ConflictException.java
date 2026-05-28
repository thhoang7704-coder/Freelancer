package com.example.freelancer.common.exception;

import org.springframework.http.HttpStatus;

// ─── 409 Conflict ────────────────────────────────────────────────────────────

public class ConflictException extends DomainException {
    public ConflictException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.CONFLICT);
    }
}
