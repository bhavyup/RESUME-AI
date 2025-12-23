package com.resumebuilder.ai_resume_api.dto.resume;

public record CertificationResponseDto(
        Long id,
        Long version,
        String name,
        String url,
        String documentUrl) {
}