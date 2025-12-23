package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Complete subscription status including usage and limits")
public record SubscriptionStatusDto(
        UserSubscriptionDto subscription,
        UsageLimitsDto limits,
        UsageStatsDto usage) {
}