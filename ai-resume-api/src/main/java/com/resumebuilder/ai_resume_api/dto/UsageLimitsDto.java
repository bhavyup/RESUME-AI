package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Feature limits based on subscription plan")
public record UsageLimitsDto(
        Integer maxBaseResumes, // null = unlimited
        Integer maxTailoredResumes, // null = unlimited
        Integer aiGenerationsPerMonth, // null = unlimited
        Integer coverLettersPerResume, // null = unlimited
        Integer atsScoresPerResume, // null = unlimited
        Boolean customTemplatesEnabled,

        // Helper fields
        Boolean hasUnlimitedBaseResumes,
        Boolean hasUnlimitedTailoredResumes,
        Boolean hasUnlimitedAiGenerations) {
}