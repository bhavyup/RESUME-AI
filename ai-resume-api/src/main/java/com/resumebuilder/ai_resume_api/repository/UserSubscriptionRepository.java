package com.resumebuilder.ai_resume_api.repository;

import com.resumebuilder.ai_resume_api.entity.UserSubscriptionEntity;
import com.resumebuilder.ai_resume_api.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscriptionEntity, Long> {

    Optional<UserSubscriptionEntity> findByUserId(Long userId);

    Optional<UserSubscriptionEntity> findByStripeCustomerId(String stripeCustomerId);

    Optional<UserSubscriptionEntity> findByStripeSubscriptionId(String stripeSubscriptionId);

    List<UserSubscriptionEntity> findAllByStatus(SubscriptionStatus status);

    @Query("SELECT us FROM UserSubscriptionEntity us WHERE us.status = 'TRIALING' AND us.trialEnd < :now")
    List<UserSubscriptionEntity> findExpiredTrials(@Param("now") Instant now);

    @Query("SELECT us FROM UserSubscriptionEntity us WHERE us.cancelAtPeriodEnd = true AND us.currentPeriodEnd < :now")
    List<UserSubscriptionEntity> findPendingCancellations(@Param("now") Instant now);

    @Query("SELECT COUNT(us) FROM UserSubscriptionEntity us WHERE us.plan.planType = 'PRO' AND us.status IN ('ACTIVE', 'TRIALING')")
    long countActiveProSubscriptions();
}