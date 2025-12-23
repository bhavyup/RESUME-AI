package com.resumebuilder.ai_resume_api.dto.ai;

public record AtsCriterionScoreDto(
        String name, // e.g., "keywords", "skills", "bullets"
        int score, // 0..maxScore
        int maxScore,
        String details // human-readable short explanation
) {
}