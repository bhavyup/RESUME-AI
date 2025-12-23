package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

public record ExperienceResponseDto(
        Long id,
        Long version,

        String jobTitle,
        String companyName,
        String companyWebsite,

        String location,
        String locationCity,
        String locationState,
        String locationCountry,
        boolean remote,

        String employmentType,

        LocalDate startDate,
        LocalDate endDate,
        boolean currentlyWorking,

        String description,
        List<String> responsibilities,
        List<String> achievements,
        List<String> technologies,
        List<String> methods,
        List<ExperienceLinkDto> links,

        String managerName,
        String managerContact,
        Integer teamSize,
        String seniorityLevel,
        String reportsToTitle,

        boolean confidential,

        String starSituation,
        String starTask,
        String starAction,
        String starResult,

        BigDecimal kpiRevenueImpactUsd,
        BigDecimal kpiPercentImprovement,
        Integer kpiTimeSavedHours,
        Integer kpiUsers,
        BigDecimal kpiArrUsd,

        // computed
        Integer durationMonths,
        String durationHumanized) {
}