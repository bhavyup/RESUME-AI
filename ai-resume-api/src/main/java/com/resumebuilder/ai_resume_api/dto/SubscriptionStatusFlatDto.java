package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Flat subscription status DTO matching frontend expectations (Supabase schema)
 * Used by: Settings page, Dashboard checks
 */
@Schema(description = "Subscription status in flat structure for frontend compatibility")
public record SubscriptionStatusFlatDto(
        // Core subscription fields (matches Supabase schema exactly)
        @Schema(description = "Subscription plan type", example = "pro") String subscription_plan, // "free" or "pro"

        @Schema(description = "Subscription status", example = "active") String subscription_status, // "active",
                                                                                                     // "canceled",
                                                                                                     // "trialing",
                                                                                                     // "past_due", etc.

        @Schema(description = "Current period end date (ISO 8601)", example = "2025-02-01T00:00:00Z") String current_period_end, // ISO
                                                                                                                                 // 8601
                                                                                                                                 // string

        @Schema(description = "Trial end date (ISO 8601)", example = "2025-01-15T00:00:00Z") String trial_end, // ISO
                                                                                                               // 8601
                                                                                                               // string

        @Schema(description = "Stripe customer ID", example = "cus_xxxxxxxxxxxxx") String stripe_customer_id,

        @Schema(description = "Stripe subscription ID", example = "sub_xxxxxxxxxxxxx") String stripe_subscription_id,

        // Additional fields for frontend convenience (not in original Supabase)
        @Schema(description = "Current base resumes count", example = "2") Integer base_resumes_count,

        @Schema(description = "Current tailored resumes count", example = "4") Integer tailored_resumes_count,

        @Schema(description = "Can create more base resumes", example = "true") Boolean can_create_base,

        @Schema(description = "Can create more tailored resumes", example = "false") Boolean can_create_tailored,

        @Schema(description = "Maximum allowed base resumes (null = unlimited)", example = "3") Integer max_base_resumes,

        @Schema(description = "Maximum allowed tailored resumes (null = unlimited)", example = "5") Integer max_tailored_resumes) {
    /**
     * Helper to check if user is on Pro plan
     */
    public boolean isPro() {
        return "pro".equalsIgnoreCase(subscription_plan);
    }

    /**
     * Helper to check if subscription is active
     */
    public boolean isActive() {
        return "active".equalsIgnoreCase(subscription_status);
    }

    /**
     * Helper to check if user is in trial
     */
    public boolean isTrialing() {
        return "trialing".equalsIgnoreCase(subscription_status);
    }
}