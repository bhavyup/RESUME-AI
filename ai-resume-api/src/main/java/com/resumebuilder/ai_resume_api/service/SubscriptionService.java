package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.*;
import com.resumebuilder.ai_resume_api.entity.*;
import com.resumebuilder.ai_resume_api.enums.*;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.repository.resume.*;
import com.resumebuilder.ai_resume_api.repository.*;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.resumebuilder.ai_resume_api.dto.SubscriptionStatusFlatDto;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class SubscriptionService {

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserSubscriptionRepository subscriptionRepository;
    private final ResumeRepository resumeRepository;
    private final UsageTrackingRepository usageRepository;
    private final com.resumebuilder.ai_resume_api.mapper.SubscriptionMapper subscriptionMapper;

    public SubscriptionService(
            UserRepository userRepository,
            SubscriptionPlanRepository planRepository,
            UserSubscriptionRepository subscriptionRepository,
            ResumeRepository resumeRepository,
            UsageTrackingRepository usageRepository,
            com.resumebuilder.ai_resume_api.mapper.SubscriptionMapper subscriptionMapper) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.resumeRepository = resumeRepository;
        this.usageRepository = usageRepository;
        this.subscriptionMapper = subscriptionMapper;
    }

    /**
     * Get current user's subscription status
     */
    @Transactional(readOnly = true)
    public SubscriptionStatusDto getCurrentSubscriptionStatus() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));

        var subscription = getOrCreateSubscription(user);
        var limits = buildLimitsDto(subscription.getPlan());
        var usage = buildUsageStatsDto(user, subscription);

        return new SubscriptionStatusDto(
                toSubscriptionDto(subscription),
                limits,
                usage);
    }

    /**
     * Get subscription status in flat structure (frontend-compatible)
     */
    @Transactional(readOnly = true)
    public SubscriptionStatusFlatDto getCurrentSubscriptionStatusFlat(UserEntity user) {
        var subscription = getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // Count resumes by type
        long baseCount = resumeRepository.countByUserIdAndResumeType(user.getId(), ResumeType.BASE);
        long tailoredCount = resumeRepository.countByUserIdAndResumeType(user.getId(), ResumeType.TAILORED);

        // Check if user can create more
        boolean canCreateBase = plan.getMaxBaseResumes() == null || baseCount < plan.getMaxBaseResumes();
        boolean canCreateTailored = plan.getMaxTailoredResumes() == null
                || tailoredCount < plan.getMaxTailoredResumes();

        return new SubscriptionStatusFlatDto(
                plan.getPlanType().name().toLowerCase(), // "free" or "pro"
                subscription.getStatus().name().toLowerCase(), // "active", "canceled", etc.
                formatInstant(subscription.getCurrentPeriodEnd()),
                formatInstant(subscription.getTrialEnd()),
                subscription.getStripeCustomerId(),
                subscription.getStripeSubscriptionId(),
                (int) baseCount,
                (int) tailoredCount,
                canCreateBase,
                canCreateTailored,
                plan.getMaxBaseResumes(),
                plan.getMaxTailoredResumes());
    }

    /**
     * Format Instant to ISO 8601 string (or null)
     */
    private String formatInstant(Instant instant) {
        return instant != null ? instant.toString() : null;
    }

    /**
     * Get all available plans
     */
    @Transactional(readOnly = true)
    public List<SubscriptionPlanDto> getAvailablePlans() {
        return planRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::toPlanDto)
                .toList();
    }

    /**
     * Get specific plan by type
     */
    @Transactional(readOnly = true)
    public SubscriptionPlanEntity getPlanByType(SubscriptionPlanType planType) {
        return planRepository.findByPlanType(planType)
                .orElseThrow(() -> new NotFoundException("Plan not found: " + planType));
    }

    /**
     * Get or create subscription for user (ensures every user has one)
     */
    @Transactional
    public UserSubscriptionEntity getOrCreateSubscription(UserEntity user) {
        return subscriptionRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultSubscription(user));
    }

    /**
     * Create default FREE subscription for new user
     */
    private UserSubscriptionEntity createDefaultSubscription(UserEntity user) {
        var freePlan = getPlanByType(SubscriptionPlanType.FREE);

        var subscription = new UserSubscriptionEntity();
        subscription.setUser(user);
        subscription.setPlan(freePlan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCurrentPeriodStart(Instant.now());
        // Free plan has no end date
        subscription.setCurrentPeriodEnd(null);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Upgrade user to PRO plan (called after successful Stripe payment)
     */
    @Transactional
    public UserSubscriptionEntity upgradeToProWithTrial(
            UserEntity user,
            String stripeCustomerId,
            String stripeSubscriptionId,
            Instant trialEnd,
            Instant periodStart,
            Instant periodEnd) {

        var proPlan = getPlanByType(SubscriptionPlanType.PRO);
        var subscription = getOrCreateSubscription(user);

        subscription.setPlan(proPlan);
        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStripeSubscriptionId(stripeSubscriptionId);
        subscription.setStatus(SubscriptionStatus.TRIALING);
        subscription.setTrialStart(Instant.now());
        subscription.setTrialEnd(trialEnd);
        subscription.setCurrentPeriodStart(periodStart);
        subscription.setCurrentPeriodEnd(periodEnd);
        subscription.setCancelAtPeriodEnd(false);
        subscription.setCanceledAt(null);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Activate PRO subscription after trial or payment
     */
    @Transactional
    public UserSubscriptionEntity activateProSubscription(
            String stripeSubscriptionId,
            Instant periodStart,
            Instant periodEnd) {

        var subscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found"));

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCurrentPeriodStart(periodStart);
        subscription.setCurrentPeriodEnd(periodEnd);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Cancel subscription at period end
     */
    @Transactional
    public UserSubscriptionEntity cancelSubscription(Long userId) {
        var subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Subscription not found"));

        if (subscription.isFree()) {
            throw new BadRequestException("Cannot cancel free plan");
        }

        subscription.setCancelAtPeriodEnd(true);
        subscription.setCanceledAt(Instant.now());

        return subscriptionRepository.save(subscription);
    }

    /**
     * Downgrade to FREE plan (called when subscription ends or payment fails)
     */
    @Transactional
    public UserSubscriptionEntity downgradeToFree(Long userId) {
        var subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Subscription not found"));

        var freePlan = getPlanByType(SubscriptionPlanType.FREE);

        subscription.setPlan(freePlan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStripeCustomerId(null);
        subscription.setStripeSubscriptionId(null);
        subscription.setCurrentPeriodStart(Instant.now());
        subscription.setCurrentPeriodEnd(null);
        subscription.setTrialStart(null);
        subscription.setTrialEnd(null);
        subscription.setCancelAtPeriodEnd(false);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Update subscription status from Stripe webhook
     */
    @Transactional
    public UserSubscriptionEntity updateSubscriptionStatus(
            String stripeSubscriptionId,
            SubscriptionStatus status,
            Instant periodStart,
            Instant periodEnd) {

        var subscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found"));

        subscription.setStatus(status);
        subscription.setCurrentPeriodStart(periodStart);
        subscription.setCurrentPeriodEnd(periodEnd);

        return subscriptionRepository.save(subscription);
    }

    /**
     * Process expired trials (scheduled job)
     */
    @Transactional
    public void processExpiredTrials() {
        var expiredTrials = subscriptionRepository.findExpiredTrials(Instant.now());

        for (var subscription : expiredTrials) {
            // Downgrade to FREE if trial expired without payment
            if (subscription.getStripeSubscriptionId() == null) {
                downgradeToFree(subscription.getUser().getId());
            } else {
                // If they have active Stripe subscription, it should auto-convert
                // This is handled by Stripe webhooks
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscriptionRepository.save(subscription);
            }
        }
    }

    /**
     * Process pending cancellations (scheduled job)
     */
    @Transactional
    public void processPendingCancellations() {
        var pendingCancellations = subscriptionRepository.findPendingCancellations(Instant.now());

        for (var subscription : pendingCancellations) {
            downgradeToFree(subscription.getUser().getId());
        }
    }

    // ==================== Helper Methods ====================

    private UsageLimitsDto buildLimitsDto(SubscriptionPlanEntity plan) {
        return new UsageLimitsDto(
                plan.getMaxBaseResumes(),
                plan.getMaxTailoredResumes(),
                plan.getAiGenerationsPerMonth(),
                plan.getCoverLettersPerResume(),
                plan.getAtsScoresPerResume(),
                plan.getCustomTemplatesEnabled(),
                plan.isUnlimited("base_resumes"),
                plan.isUnlimited("tailored_resumes"),
                plan.isUnlimited("ai_generations"));
    }

    private UsageStatsDto buildUsageStatsDto(UserEntity user, UserSubscriptionEntity subscription) {
        var plan = subscription.getPlan();

        // Count resumes by type
        long baseCount = resumeRepository.countByUserIdAndResumeType(user.getId(), ResumeType.BASE);
        long tailoredCount = resumeRepository.countByUserIdAndResumeType(user.getId(), ResumeType.TAILORED);

        // Count AI usage this month
        var periodStart = subscription.getCurrentPeriodStart() != null
                ? subscription.getCurrentPeriodStart()
                : Instant.now().minus(30, ChronoUnit.DAYS);
        var periodEnd = subscription.getCurrentPeriodEnd() != null
                ? subscription.getCurrentPeriodEnd()
                : Instant.now().plus(30, ChronoUnit.DAYS);

        long aiUsage = usageRepository.countUsageInPeriod(
                user.getId(),
                UsageType.AI_GENERATION,
                periodStart,
                periodEnd);

        // Check if user can create more
        boolean canCreateBase = plan.getMaxBaseResumes() == null || baseCount < plan.getMaxBaseResumes();
        boolean canCreateTailored = plan.getMaxTailoredResumes() == null
                || tailoredCount < plan.getMaxTailoredResumes();
        boolean canUseAi = plan.getAiGenerationsPerMonth() == null || aiUsage < plan.getAiGenerationsPerMonth();

        // Format status strings
        String baseStatus = formatUsageStatus(baseCount, plan.getMaxBaseResumes());
        String tailoredStatus = formatUsageStatus(tailoredCount, plan.getMaxTailoredResumes());
        String aiStatus = formatUsageStatus(aiUsage, plan.getAiGenerationsPerMonth());

        return new UsageStatsDto(
                baseCount,
                tailoredCount,
                aiUsage,
                canCreateBase,
                canCreateTailored,
                canUseAi,
                baseStatus,
                tailoredStatus,
                aiStatus);
    }

    /**
     * Count active PRO subscriptions (for statistics)
     */
    @Transactional(readOnly = true)
    public long countActiveProSubscriptions() {
        return subscriptionRepository.countActiveProSubscriptions();
    }

    private String formatUsageStatus(long current, Integer limit) {
        if (limit == null) {
            return current + "/unlimited";
        }
        return current + "/" + limit;
    }

    private SubscriptionPlanDto toPlanDto(SubscriptionPlanEntity entity) {
        return subscriptionMapper.toPlanDto(entity);
    }

    private UserSubscriptionDto toSubscriptionDto(UserSubscriptionEntity entity) {
        return subscriptionMapper.toSubscriptionDto(entity);
    }
}