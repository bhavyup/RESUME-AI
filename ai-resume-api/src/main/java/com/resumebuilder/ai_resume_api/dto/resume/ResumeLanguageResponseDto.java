package com.resumebuilder.ai_resume_api.dto.resume;

public record ResumeLanguageResponseDto(
        Long id,
        Long version,
        String languageName,
        String proficiency) {
}