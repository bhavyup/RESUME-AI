package com.resumebuilder.ai_resume_api.dto.resume;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProjectResponseDto(
        Long id,
        Long version,

        String title,
        String projectType,
        String role,
        String shortDescription,

        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyActive,

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
        String licenseUrl,

        Integer durationMonths,
        String durationHumanized) {
}