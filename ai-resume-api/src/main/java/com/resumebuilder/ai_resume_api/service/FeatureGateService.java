package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.enums.ResumeType;
import com.resumebuilder.ai_resume_api.enums.UsageType;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.repository.resume.ResumeRepository;
import com.resumebuilder.ai_resume_api.repository.UsageTrackingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service to check and enforce feature limits based on subscription plan
 */
@Service
public class FeatureGateService {

    private final SubscriptionService subscriptionService;
    private final ResumeRepository resumeRepository;
    private final UsageTrackingRepository usageRepository;

    public FeatureGateService(
            SubscriptionService subscriptionService,
            ResumeRepository resumeRepository,
            UsageTrackingRepository usageRepository) {
        this.subscriptionService = subscriptionService;
        this.resumeRepository = resumeRepository;
        this.usageRepository = usageRepository;
    }

    /**
     * Check if user can create a base resume
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanCreateBaseResume(UserEntity user) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getMaxBaseResumes() == null) {
            return;
        }

        long currentCount = resumeRepository.countByUserIdAndResumeType(user.getId(), ResumeType.BASE);

        if (currentCount >= plan.getMaxBaseResumes()) {
            throw new BadRequestException(
                    String.format("Base resume limit reached (%d/%d). Upgrade to Pro for unlimited resumes.",
                            currentCount, plan.getMaxBaseResumes()));
        }
    }

    /**
     * Check if user can create a tailored resume
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanCreateTailoredResume(UserEntity user) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getMaxTailoredResumes() == null) {
            return;
        }

        long currentCount = resumeRepository.countByUserIdAndResumeType(user.getId(), ResumeType.TAILORED);

        if (currentCount >= plan.getMaxTailoredResumes()) {
            throw new BadRequestException(
                    String.format("Tailored resume limit reached (%d/%d). Upgrade to Pro for unlimited resumes.",
                            currentCount, plan.getMaxTailoredResumes()));
        }
    }

    /**
     * Check if user can use AI generation
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanUseAiGeneration(UserEntity user) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getAiGenerationsPerMonth() == null) {
            return;
        }

        var periodStart = subscription.getCurrentPeriodStart() != null
                ? subscription.getCurrentPeriodStart()
                : Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        var periodEnd = subscription.getCurrentPeriodEnd() != null
                ? subscription.getCurrentPeriodEnd()
                : Instant.now().plus(30, java.time.temporal.ChronoUnit.DAYS);

        long usage = usageRepository.countUsageInPeriod(
                user.getId(),
                UsageType.AI_GENERATION,
                periodStart,
                periodEnd);

        if (usage >= plan.getAiGenerationsPerMonth()) {
            throw new BadRequestException(
                    String.format(
                            "AI generation limit reached (%d/%d this month). Upgrade to Pro for unlimited AI generations.",
                            usage, plan.getAiGenerationsPerMonth()));
        }
    }

    /**
     * Check if user can generate cover letter for a resume
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanCreateCoverLetter(UserEntity user, Long resumeId) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getCoverLettersPerResume() == null) {
            return;
        }

        long usage = usageRepository.countUsageForResource(
                user.getId(),
                UsageType.COVER_LETTER,
                "RESUME",
                resumeId);

        if (usage >= plan.getCoverLettersPerResume()) {
            throw new BadRequestException(
                    String.format(
                            "Cover letter limit reached for this resume (%d/%d). Upgrade to Pro for unlimited cover letters.",
                            usage, plan.getCoverLettersPerResume()));
        }
    }

    /**
     * Check if user can run ATS score for a resume
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanRunAtsScore(UserEntity user, Long resumeId) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getAtsScoresPerResume() == null) {
            return;
        }

        long usage = usageRepository.countUsageForResource(
                user.getId(),
                UsageType.ATS_SCORE,
                "RESUME",
                resumeId);

        if (usage >= plan.getAtsScoresPerResume()) {
            throw new BadRequestException(
                    String.format(
                            "ATS score limit reached for this resume (%d/%d). Upgrade to Pro for unlimited ATS scores.",
                            usage, plan.getAtsScoresPerResume()));
        }
    }

    /**
     * Check if user can use custom templates
     * 
     * @throws BadRequestException if not allowed
     */
    @Transactional(readOnly = true)
    public void checkCanUseCustomTemplates(UserEntity user) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        if (!plan.getCustomTemplatesEnabled()) {
            throw new BadRequestException(
                    "Custom templates are only available for Pro users. Upgrade to access custom templates.");
        }
    }

    /**
     * Check if user can use bullet rewrite for a resume
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanUseBulletRewrite(UserEntity user, Long resumeId) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getMaxBaseResumes() == null) {
            return;
        }

        // Free plan: 1 per resume
        long usage = usageRepository.countUsageForResource(
                user.getId(),
                UsageType.BULLET_REWRITE,
                "RESUME",
                resumeId);

        if (usage >= 1) {
            throw new BadRequestException(
                    "Bullet rewrite limit reached for this resume (1/1). Upgrade to Pro for unlimited rewrites.");
        }
    }

    /**
     * Check if user can use resume tailoring
     * 
     * @throws BadRequestException if limit exceeded
     */
    @Transactional(readOnly = true)
    public void checkCanUseTailoring(UserEntity user) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        var plan = subscription.getPlan();

        // PRO plan: unlimited
        if (plan.getMaxTailoredResumes() == null) {
            return;
        }

        // Free plan: 1 per month
        var periodStart = subscription.getCurrentPeriodStart() != null
                ? subscription.getCurrentPeriodStart()
                : Instant.now().minus(30, java.time.temporal.ChronoUnit.DAYS);
        var periodEnd = subscription.getCurrentPeriodEnd() != null
                ? subscription.getCurrentPeriodEnd()
                : Instant.now().plus(30, java.time.temporal.ChronoUnit.DAYS);

        long usage = usageRepository.countUsageInPeriod(
                user.getId(),
                UsageType.TAILORING,
                periodStart,
                periodEnd);

        if (usage >= 1) {
            throw new BadRequestException(
                    "Resume tailoring limit reached this month (1/1). Upgrade to Pro for unlimited tailoring.");
        }
    }

    /**
     * Check if user has PRO plan
     */
    @Transactional(readOnly = true)
    public boolean isPro(UserEntity user) {
        var subscription = subscriptionService.getOrCreateSubscription(user);
        return subscription.isPro() && subscription.hasValidSubscription();
    }
}