package com.resumebuilder.ai_resume_api.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Tailor resume to a job description. Reindexes chunks if requested.", example = """
        {
          "jobDescription": "We are looking for a software engineer with experience in Python and Flask...",
          "topK": 8,
          "reindex": false,
          "tone": "PROFESSIONAL",
          "model": "primary"
        }
        """)
public record TailorRequestDto(
        @NotBlank @Size(max = 20000) String jobDescription,
        Integer topK, // default 8
        Boolean reindex, // default false
        String tone, // PROFESSIONAL/TECHNICAL/FRIENDLY (optional)
        String model // primary/secondary/fallback/tiny or raw model id
) {
}