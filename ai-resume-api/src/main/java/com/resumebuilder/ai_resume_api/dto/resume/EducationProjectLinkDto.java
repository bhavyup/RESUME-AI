package com.resumebuilder.ai_resume_api.dto.resume;

import jakarta.validation.constraints.NotBlank;

public record EducationProjectLinkDto(
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "URL is required") String url) {
}