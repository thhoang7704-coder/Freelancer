package com.example.freelancer.common.exception;

import org.springframework.http.HttpStatus;

// ─── 403 Forbidden ───────────────────────────────────────────────────────────

public class ForbiddenException extends DomainException {
    public ForbiddenException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.FORBIDDEN);
    }

    public ForbiddenException(String message) {
        super("FORBIDDEN", message, HttpStatus.FORBIDDEN);
    }
}