package com.example.freelancer.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base class for all domain exceptions.
 * Each exception carries an error code (for ApiResponse.error field)
 * and an HTTP status code.
 */
public class DomainException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public DomainException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}