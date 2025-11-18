package com.resumebuilder.ai_resume_api.enums;

/**
 * Subscription status (mirrors Stripe subscription statuses)
 */
public enum SubscriptionStatus {
    ACTIVE, // Subscription is active and paid
    TRIALING, // In trial period
    PAST_DUE, // Payment failed, in grace period
    CANCELED, // User canceled, still valid until period end
    UNPAID, // Payment failed, no longer valid
    INCOMPLETE, // Initial payment incomplete
    INCOMPLETE_EXPIRED // Initial payment expired
}