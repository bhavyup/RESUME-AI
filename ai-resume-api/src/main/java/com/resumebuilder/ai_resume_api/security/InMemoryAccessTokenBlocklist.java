package com.resumebuilder.ai_resume_api.security;

import com.github.benmanes.caffeine.cache.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Service
public class InMemoryAccessTokenBlocklist implements AccessTokenBlocklist {
    private final Cache<String, Long> cache = Caffeine.newBuilder()
            .expireAfter(new Expiry<String, Long>() {
                @Override
                public long expireAfterCreate(String key, Long expMillis, long currentTimeNanos) {
                    long ttlMillis = Math.max(expMillis - System.currentTimeMillis(), 0);
                    return TimeUnit.MILLISECONDS.toNanos(ttlMillis);
                }

                @Override
                public long expireAfterUpdate(String key, Long value, long currentTimeNanos,
                        long currentDurationNanos) {
                    return currentDurationNanos;
                }

                @Override
                public long expireAfterRead(String key, Long value, long currentTimeNanos, long currentDurationNanos) {
                    return currentDurationNanos;
                }
            })
            .maximumSize(200_000)
            .build();

    @Override
    public void revoke(String jti, Instant expiresAt) {
        cache.put(jti, expiresAt.toEpochMilli());
    }

    @Override
    public boolean isRevoked(String jti) {
        return cache.getIfPresent(jti) != null;
    }
}