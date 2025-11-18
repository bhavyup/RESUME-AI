package com.resumebuilder.ai_resume_api.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "A suggestion to improve ATS match", example = """
        {
          "title": "Add Kubernetes to Experience 1",
          "description": "Kubernetes is a key skill for the job",
          "before": "Led a team to deploy microservices using Docker and AWS.",
          "after": "Led a team to deploy microservices using Docker, Kubernetes, and AWS.",
          "benefit": "Improves keyword match by ~8%"
        }
        """)
public record AtsSuggestionDto(
        String title, // e.g., "Add Kubernetes to Experience 1"
        String description, // why
        String before, // optional snippet before
        String after, // optional suggested rewrite
        String benefit // e.g., "Improves keyword match by ~8%"
) {
}