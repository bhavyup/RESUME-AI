package com.resumebuilder.ai_resume_api.security;

public interface AccessTokenBlocklist {
    void revoke(String jti, java.time.Instant expiresAt);

    boolean isRevoked(String jti);
}