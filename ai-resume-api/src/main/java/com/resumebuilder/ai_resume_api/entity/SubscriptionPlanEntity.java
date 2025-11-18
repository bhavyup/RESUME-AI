package com.resumebuilder.ai_resume_api.entity;

import com.resumebuilder.ai_resume_api.enums.SubscriptionPlanType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlanEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", nullable = false, unique = true, length = 16)
    private SubscriptionPlanType planType;

    @NotBlank
    @Size(max = 64)
    @Column(name = "display_name", nullable = false, length = 64)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Min(0)
    @Column(name = "price_cents", nullable = false)
    private Integer priceCents = 0;

    @NotBlank
    @Size(max = 3)
    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @NotBlank
    @Size(max = 16)
    @Column(name = "billing_interval", nullable = false, length = 16)
    private String billingInterval = "MONTH";

    // Stripe Integration
    @Size(max = 128)
    @Column(name = "stripe_price_id", length = 128)
    private String stripePriceId;

    @Size(max = 128)
    @Column(name = "stripe_product_id", length = 128)
    private String stripeProductId;

    // Feature Limits (NULL = unlimited)
    @Column(name = "max_base_resumes")
    private Integer maxBaseResumes;

    @Column(name = "max_tailored_resumes")
    private Integer maxTailoredResumes;

    @Column(name = "ai_generations_per_month")
    private Integer aiGenerationsPerMonth;

    @Column(name = "cover_letters_per_resume")
    private Integer coverLettersPerResume;

    @Column(name = "ats_scores_per_resume")
    private Integer atsScoresPerResume;

    @Column(name = "custom_templates_enabled", nullable = false)
    private Boolean customTemplatesEnabled = false;

    // Metadata
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "trial_period_days")
    private Integer trialPeriodDays = 0;

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
    public boolean isUnlimited(String feature) {
        return switch (feature.toLowerCase()) {
            case "base_resumes" -> maxBaseResumes == null;
            case "tailored_resumes" -> maxTailoredResumes == null;
            case "ai_generations" -> aiGenerationsPerMonth == null;
            case "cover_letters" -> coverLettersPerResume == null;
            case "ats_scores" -> atsScoresPerResume == null;
            default -> false;
        };
    }

    public boolean isFree() {
        return planType == SubscriptionPlanType.FREE;
    }

    public boolean isPro() {
        return planType == SubscriptionPlanType.PRO;
    }
}