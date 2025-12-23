package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;

public record ReferenceResponseDto(
        Long id,
        Long version,

        String name,
        String title,
        String company,

        String relationship,
        String preferredContactMethod,

        String email,
        String phone,
        String linkedinUrl,
        String websiteUrl,

        boolean consentToShare,
        boolean visible,

        String relationshipNote,
        String note,

        LocalDate lastVerifiedOn) {
}