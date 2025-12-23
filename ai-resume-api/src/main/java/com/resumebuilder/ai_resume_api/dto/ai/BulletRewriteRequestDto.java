package com.resumebuilder.ai_resume_api.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Rewrite a draft into 3 action-oriented bullets", example = """
        {
          "jobTitle": "Software Engineer",
          "draft": "Worked on developing web applications using Java and Spring Boot. Collaborated with cross-functional teams to deliver high-quality software solutions.",
          "tone": "PROFESSIONAL",
          "industry": "Technology",
          "experienceLevel": "MID"
        }
        """)
public record BulletRewriteRequestDto(
        @NotBlank @Size(max = 100) String jobTitle,
        @NotBlank @Size(max = 1000) String draft,

        // Optional tuning; can be ignored by v1 prompt
        String tone, // e.g., PROFESSIONAL, TECHNICAL, FRIENDLY
        String industry, // e.g., Technology, Finance
        String experienceLevel // e.g., JUNIOR, MID, SENIOR
) {
}