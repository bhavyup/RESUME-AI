package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Current usage statistics")
public record UsageStatsDto(
        Long baseResumesCount,
        Long tailoredResumesCount,
        Long aiGenerationsThisMonth,

        // Calculated fields
        Boolean canCreateBaseResume,
        Boolean canCreateTailoredResume,
        Boolean canUseAiGeneration,

        String baseResumesStatus, // e.g., "2/3" or "5/unlimited"
        String tailoredResumesStatus,
        String aiGenerationsStatus) {
}