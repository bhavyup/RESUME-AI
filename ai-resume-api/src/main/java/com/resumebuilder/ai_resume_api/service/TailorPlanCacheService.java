package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.ai.TailorPlanDto;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory cache for tailor plans (valid for 30 minutes)
 * Production: Replace with Redis for horizontal scaling
 */
@Service
public class TailorPlanCacheService {

    private final Map<String, CachedPlan> cache = new ConcurrentHashMap<>();
    private static final long TTL_SECONDS = 1800; // 30 minutes

    public String store(Long userId, Long baseResumeId, TailorPlanDto plan) {
        String key = UUID.randomUUID().toString();
        cache.put(key, new CachedPlan(userId, baseResumeId, plan, Instant.now()));
        cleanExpired();
        return key;
    }

    public TailorPlanDto get(Long userId, String key) {
        CachedPlan cached = cache.get(key);
        if (cached == null) {
            return null;
        }

        // Verify ownership
        if (!cached.userId.equals(userId)) {
            return null;
        }

        // Check expiry
        if (cached.createdAt.plusSeconds(TTL_SECONDS).isBefore(Instant.now())) {
            cache.remove(key);
            return null;
        }

        return cached.plan;
    }

    public void invalidate(String key) {
        cache.remove(key);
    }

    private void cleanExpired() {
        Instant now = Instant.now();
        cache.entrySet().removeIf(e -> e.getValue().createdAt.plusSeconds(TTL_SECONDS).isBefore(now));
    }

    private record CachedPlan(Long userId, Long baseResumeId, TailorPlanDto plan, Instant createdAt) {
    }
}