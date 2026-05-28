package com.example.freelancer.common.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends DomainException {
    public ResourceNotFoundException(String errorCode, String message) {
        super(errorCode, message, HttpStatus.NOT_FOUND);
    }
}
