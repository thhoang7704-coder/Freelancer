package com.example.freelancer.module.admin.dto;

import com.example.freelancer.enums.ApprovalStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProjectStatusRequest {

    @NotNull(message = "Status không được để trống")
    private ApprovalStatus status;

    private String notes;

    // Accept payloads that send 'reason' or 'note' and map them to 'notes'
    @JsonProperty("reason")
    public void setReason(String reason) {
        this.notes = reason;
    }
}