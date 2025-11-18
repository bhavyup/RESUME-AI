package com.resumebuilder.ai_resume_api.repository;

import com.resumebuilder.ai_resume_api.entity.UsageTrackingEntity;
import com.resumebuilder.ai_resume_api.enums.UsageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface UsageTrackingRepository extends JpaRepository<UsageTrackingEntity, Long> {

    @Query("SELECT COUNT(ut) FROM UsageTrackingEntity ut " +
            "WHERE ut.user.id = :userId " +
            "AND ut.usageType = :usageType " +
            "AND ut.billingPeriodStart = :periodStart " +
            "AND ut.billingPeriodEnd = :periodEnd")
    long countUsageInPeriod(
            @Param("userId") Long userId,
            @Param("usageType") UsageType usageType,
            @Param("periodStart") Instant periodStart,
            @Param("periodEnd") Instant periodEnd);

    @Query("SELECT COUNT(ut) FROM UsageTrackingEntity ut " +
            "WHERE ut.user.id = :userId " +
            "AND ut.usageType = :usageType " +
            "AND ut.resourceType = :resourceType " +
            "AND ut.resourceId = :resourceId")
    long countUsageForResource(
            @Param("userId") Long userId,
            @Param("usageType") UsageType usageType,
            @Param("resourceType") String resourceType,
            @Param("resourceId") Long resourceId);
}