package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Subscription plan details")
public record SubscriptionPlanDto(
        Long id,
        String planType,
        String displayName,
        String description,
        Integer priceCents,
        String currency,
        String billingInterval,

        // Feature limits (null = unlimited)
        Integer maxBaseResumes,
        Integer maxTailoredResumes,
        Integer aiGenerationsPerMonth,
        Integer coverLettersPerResume,
        Integer atsScoresPerResume,
        Boolean customTemplatesEnabled,

        Integer trialPeriodDays,

        // Helper fields
        String priceDisplay, // e.g., "$15.00/month"
        Boolean isFree,
        Boolean isPro) {
    public static String formatPrice(Integer cents, String currency) {
        if (cents == null || cents == 0) {
            return "Free";
        }
        double dollars = cents / 100.0;
        return String.format("$%.2f", dollars);
    }
}