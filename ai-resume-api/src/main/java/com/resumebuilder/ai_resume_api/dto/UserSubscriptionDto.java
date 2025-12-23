package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "User subscription details")
public record UserSubscriptionDto(
        Long id,
        SubscriptionPlanDto plan,
        String status,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        Instant trialEnd,
        Boolean cancelAtPeriodEnd,
        Instant canceledAt,

        // Helper fields
        Boolean isActive,
        Boolean isTrialing,
        Boolean isPro,
        Long daysUntilRenewal,
        Long daysRemainingInTrial) {
}