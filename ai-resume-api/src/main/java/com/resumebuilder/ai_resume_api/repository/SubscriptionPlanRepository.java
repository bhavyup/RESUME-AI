package com.resumebuilder.ai_resume_api.repository;

import com.resumebuilder.ai_resume_api.entity.SubscriptionPlanEntity;
import com.resumebuilder.ai_resume_api.enums.SubscriptionPlanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlanEntity, Long> {

    Optional<SubscriptionPlanEntity> findByPlanType(SubscriptionPlanType planType);

    List<SubscriptionPlanEntity> findAllByIsActiveTrue();

    Optional<SubscriptionPlanEntity> findByStripePriceId(String stripePriceId);
}