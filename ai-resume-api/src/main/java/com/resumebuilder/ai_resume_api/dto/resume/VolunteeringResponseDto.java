package com.resumebuilder.ai_resume_api.dto.resume;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record VolunteeringResponseDto(
        Long id,
        Long version,

        String title,
        String organization,

        String type,
        String status,
        String engagementMode,
        String cause,

        LocalDate startDate,
        LocalDate endDate,
        BigDecimal hours,

        String city,
        String region,
        String country,

        String orgWebsiteUrl,
        String coverImageUrl,

        String description,
        String notes,

        List<String> responsibilities,
        List<String> impacts,
        List<String> mentees,
        List<String> events,
        List<String> teachingTopics,
        List<String> keywords,
        List<String> referenceUrls,
        List<VolunteerLinkDto> links,

        Integer durationMonths,
        String durationHumanized,
        String locationDisplay) {
}