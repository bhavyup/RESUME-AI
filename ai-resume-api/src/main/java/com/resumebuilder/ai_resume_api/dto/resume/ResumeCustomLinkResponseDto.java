package com.resumebuilder.ai_resume_api.dto.resume;

public record ResumeCustomLinkResponseDto(
        Long id,
        Long version,
        String title,
        String url) {
}