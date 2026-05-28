package com.example.freelancer.module.Project.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProjectRequest {

    private String name;

    private String description;

    private BigDecimal budget;

    private LocalDate deadline;

    private List<String> skillsRequired;
}