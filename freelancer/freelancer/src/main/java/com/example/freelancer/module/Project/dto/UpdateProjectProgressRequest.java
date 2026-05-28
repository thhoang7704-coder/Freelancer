package com.example.freelancer.module.Project.dto;

import com.example.freelancer.enums.ProgressStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProjectProgressRequest {

    private ProgressStatus progressStatus;
}
