package com.resumebuilder.ai_resume_api.dto.ai;

public record BulletSuggestionDto(
        String text,
        String actionVerb,
        String impact,
        String metricSuggestion, // e.g., "~10%" or null
        String confidence, // LOW | MED | HIGH
        boolean requiresUserInput) {
}