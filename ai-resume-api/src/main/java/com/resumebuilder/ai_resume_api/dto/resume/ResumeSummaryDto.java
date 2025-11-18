package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.Instant;

public record ResumeSummaryDto(
        Long id,
        String title,
        Instant updatedAt,
        String resumeType,
        Long baseResumeId // ADD THIS FIELD
) {
}