package com.resumebuilder.ai_resume_api.dto.resume;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CourseResponseDto(
        Long id,
        Long version,

        String title,
        String provider,
        String platform,

        LocalDate startDate,
        LocalDate endDate,
        LocalDate completionDate,

        BigDecimal hours,

        String credentialId,
        String credentialUrl,
        String certificateUrl,

        String grade,
        BigDecimal score,
        String scoreUnit,

        String level,
        String deliveryMode,
        String status,

        String description,
        String notes,

        List<String> instructors,
        List<String> topics,
        List<CourseLinkDto> links,

        Integer durationMonths,
        String durationHumanized) {
}