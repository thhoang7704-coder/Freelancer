package com.example.freelancer.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Getter;

/**
 * Standardized API response wrapper for ALL endpoints.
 *
 * Success: { "success": true, "data": {...}, "message": "OK" }
 * Error: { "success": false, "error": "ERROR_CODE", "message": "Description" }
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final String error;

    private ApiResponse(boolean success, T data, String message, String error) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.error = error;
    }

    // ── Factory Methods ──────────────────────────────────────────────────────

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "OK", null);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message, null);
    }

    public static <T> ApiResponse<T> message(String message) {
        return new ApiResponse<>(true, null, message, null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return new ApiResponse<>(false, null, message, errorCode);
    }
}
