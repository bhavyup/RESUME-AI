package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "DTO representing a link associated with an experience entry", example = """
        {
          "title": "Company Website",
          "url": "https://www.company.com"
        }
        """)
public record ExperienceLinkDto(
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "URL is required") String url) {
}