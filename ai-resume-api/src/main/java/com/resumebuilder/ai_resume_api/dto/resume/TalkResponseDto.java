package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;
import java.util.List;

public record TalkResponseDto(
        Long id,
        Long version,

        String title,
        String eventName,
        String organizer,
        String track,

        String type,
        String role,
        String status,

        LocalDate startDate,
        LocalDate endDate,

        boolean isVirtual,
        String venue,
        String city,
        String region,
        String country,
        String language,
        Integer audienceSize,

        String slidesUrl,
        String videoUrl,
        String eventUrl,
        String coverImageUrl,

        String abstractText,
        String description,
        String notes,

        List<String> coSpeakers,
        List<String> keywords,
        List<TalkLinkDto> links,

        Integer durationDays,
        String durationHumanized,
        String locationDisplay) {
}