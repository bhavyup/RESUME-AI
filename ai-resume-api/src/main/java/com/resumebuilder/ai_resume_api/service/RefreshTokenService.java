package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.entity.RefreshTokenEntity;
import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository repo;
    private final long refreshTtlSeconds;
    private final SecureRandom random = new SecureRandom();
    final RefreshTokenService self; // to enable self-invocation of @Transactional methods

    public RefreshTokenService(RefreshTokenRepository repo,
            @Value("${application.jwt.refresh-ttl-seconds:1209600}") long refreshTtlSeconds,
            @Lazy RefreshTokenService self) { // default 14 days
        this.repo = repo;
        this.refreshTtlSeconds = refreshTtlSeconds;
        this.self = self;
    }

    public String generateRawToken() {
        byte[] bytes = new byte[32]; // 256-bit
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public String sha256(String raw) {
        try {
            var md = java.security.MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    @Transactional
    public RefreshTokenEntity issue(UserEntity user, String ip, String userAgent) {
        String raw = generateRawToken();
        String hash = sha256(raw);

        var rt = new RefreshTokenEntity();
        rt.setUser(user);
        rt.setTokenHash(hash);
        rt.setExpiresAt(Instant.now().plusSeconds(refreshTtlSeconds));
        rt.setIpAddress(ip);
        rt.setUserAgent(userAgent);
        repo.save(rt);

        rt.setTokenHash(raw); // temporarily overload to return raw
        return rt;
    }

    @Transactional
    public RefreshTokenEntity rotate(String raw, String ip, String userAgent) {
        String hash = sha256(raw);
        var existing = repo.findByTokenHash(hash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (existing.getRevokedAt() != null || existing.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Expired or revoked refresh token");
        }

        var newToken = self.issue(existing.getUser(), ip, userAgent);
        String newRaw = newToken.getTokenHash(); // raw

        existing.setRevokedAt(Instant.now());
        existing.setReplacedById(newToken.getId());
        repo.save(existing);

        newToken.setTokenHash(newRaw); // return raw
        return newToken;
    }

    @Transactional
    public void revoke(String raw) {
        String hash = sha256(raw);
        repo.findByTokenHash(hash).ifPresent(rt -> {
            rt.setRevokedAt(Instant.now());
            repo.save(rt);
        });
    }
}