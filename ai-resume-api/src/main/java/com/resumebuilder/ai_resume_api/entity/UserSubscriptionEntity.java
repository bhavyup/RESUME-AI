package com.resumebuilder.ai_resume_api.entity;

import com.resumebuilder.ai_resume_api.enums.SubscriptionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_subscriptions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_subscription", columnNames = "user_id")
})
public class UserSubscriptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlanEntity plan;

    // Stripe Integration
    @Size(max = 128)
    @Column(name = "stripe_customer_id", unique = true, length = 128)
    private String stripeCustomerId;

    @Size(max = 128)
    @Column(name = "stripe_subscription_id", unique = true, length = 128)
    private String stripeSubscriptionId;

    // Status
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    // Billing Period
    @Column(name = "current_period_start")
    private Instant currentPeriodStart;

    @Column(name = "current_period_end")
    private Instant currentPeriodEnd;

    // Trial
    @Column(name = "trial_start")
    private Instant trialStart;

    @Column(name = "trial_end")
    private Instant trialEnd;

    // Cancellation
    @Column(name = "cancel_at_period_end", nullable = false)
    private Boolean cancelAtPeriodEnd = false;

    @Column(name = "canceled_at")
    private Instant canceledAt;

    // Metadata
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Helper methods
    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE;
    }

    public boolean isTrialing() {
        return status == SubscriptionStatus.TRIALING;
    }

    public boolean isActiveOrTrialing() {
        return isActive() || isTrialing();
    }

    public boolean isPro() {
        return plan != null && plan.isPro();
    }

    public boolean isFree() {
        return plan != null && plan.isFree();
    }

    public boolean hasValidSubscription() {
        if (!isActiveOrTrialing()) {
            return false;
        }

        // Check if trial expired
        if (isTrialing() && trialEnd != null && trialEnd.isBefore(Instant.now())) {
            return false;
        }

        // Check if period ended
        if (currentPeriodEnd != null && currentPeriodEnd.isBefore(Instant.now())) {
            return false;
        }

        return true;
    }
}