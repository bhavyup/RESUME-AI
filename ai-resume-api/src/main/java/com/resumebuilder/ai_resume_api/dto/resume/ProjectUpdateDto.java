package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProjectUpdateDto(
        @NotNull Long version,

        @NotBlank(message = "Title is required") String title,

        @Schema(allowableValues = {
                "PERSONAL", "ACADEMIC", "OPEN_SOURCE", "FREELANCE", "COLLABORATIVE" }) @NotBlank(message = "Project Type is required") String projectType,

        @Schema(allowableValues = { "LEAD_DEV", "DATA_SCIENTIST", "PM", "DESIGNER", "ENGINEER", "QA", "DEVOPS",
                "OTHER" }) String role,

        String shortDescription,

        LocalDate startDate,
        LocalDate endDate,
        Boolean currentlyActive,

        List<String> technologies,
        List<String> features,

        List<ProjectLinkDto> links,
        List<ProjectMediaDto> media,

        String outcomeSummary,
        Long downloadsCount,
        Long usersCount,
        Long starsCount,
        BigDecimal revenueImpactUsd,

        String licenseSpdx,
        String licenseUrl){
}