package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.entity.UsageTrackingEntity;
import com.resumebuilder.ai_resume_api.enums.UsageType;
import com.resumebuilder.ai_resume_api.repository.UsageTrackingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

/**
 * Service to track feature usage for billing limits
 */
@Service
public class UsageTrackingService {

    private final UsageTrackingRepository usageRepository;
    private final SubscriptionService subscriptionService;

    public UsageTrackingService(
            UsageTrackingRepository usageRepository,
            SubscriptionService subscriptionService) {
        this.usageRepository = usageRepository;
        this.subscriptionService = subscriptionService;
    }

    /**
     * Track AI generation usage
     */
    @Transactional
    public void trackAiGeneration(UserEntity user, Map<String, Object> metadata) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        trackUsage(user, UsageType.AI_GENERATION, null, null, subscription, metadata);
    }

    /**
     * Track cover letter generation for a resume
     */
    @Transactional
    public void trackCoverLetterGeneration(UserEntity user, Long resumeId, Map<String, Object> metadata) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        trackUsage(user, UsageType.COVER_LETTER, "RESUME", resumeId, subscription, metadata);
    }

    /**
     * Track ATS score analysis for a resume
     */
    @Transactional
    public void trackAtsScore(UserEntity user, Long resumeId, Map<String, Object> metadata) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        trackUsage(user, UsageType.ATS_SCORE, "RESUME", resumeId, subscription, metadata);
    }

    /**
     * Internal method to record usage
     */
    private void trackUsage(
            UserEntity user,
            UsageType usageType,
            String resourceType,
            Long resourceId,
            com.resumebuilder.ai_resume_api.entity.UserSubscriptionEntity subscription,
            Map<String, Object> metadata) {

        var periodStart = subscription.getCurrentPeriodStart() != null
                ? subscription.getCurrentPeriodStart()
                : Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        var periodEnd = subscription.getCurrentPeriodEnd() != null
                ? subscription.getCurrentPeriodEnd()
                : Instant.now().plus(30, java.time.temporal.ChronoUnit.DAYS);

        var usage = new UsageTrackingEntity();
        usage.setUser(user);
        usage.setUsageType(usageType);
        usage.setResourceType(resourceType);
        usage.setResourceId(resourceId);
        usage.setBillingPeriodStart(periodStart);
        usage.setBillingPeriodEnd(periodEnd);
        usage.setMetadata(metadata);

        usageRepository.save(usage);
    }

    /**
     * Track bullet rewrite usage for a resume
     */
    @Transactional
    public void trackBulletRewrite(UserEntity user, Long resumeId, Map<String, Object> metadata) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        trackUsage(user, UsageType.BULLET_REWRITE, "RESUME", resumeId, subscription, metadata);
    }

    /**
     * Track resume tailoring usage
     */
    @Transactional
    public void trackTailoring(UserEntity user, Long resumeId, Map<String, Object> metadata) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        trackUsage(user, UsageType.TAILORING, "RESUME", resumeId, subscription, metadata);
    }
}