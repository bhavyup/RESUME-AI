package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.entity.EmailVerificationToken;
import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.repository.EmailVerificationTokenRepository;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import org.springframework.core.env.Environment;

@Service
public class EmailVerificationService {
    private final EmailVerificationTokenRepository repo;
    private final UserRepository userRepository;
    private final Environment env;

    public EmailVerificationService(EmailVerificationTokenRepository repo, UserRepository userRepository, Environment env) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.env = env;
    }

    public String issue(UserEntity user) {
        repo.deleteAllByUserId(user.getId());
        String raw = java.util.UUID.randomUUID().toString().replace("-", "");
        String hash = sha256(raw);
        var token = new EmailVerificationToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setExpiresAt(java.time.Instant.now().plus(java.time.Duration.ofDays(1)));
        repo.save(token);
        return raw; // send via email
    }

    public void verify(String raw) {
        String hash = sha256(raw);
        var token = repo.findByTokenHash(hash).orElseThrow(() -> new NotFoundException("Invalid token"));
        if (token.getConsumedAt() != null || token.getExpiresAt().isBefore(java.time.Instant.now())) {
            throw new IllegalArgumentException("Expired or used token");
        }
        var user = token.getUser();
        user.setEnabled(true);
        token.setConsumedAt(java.time.Instant.now());
        repo.save(token);
        userRepository.save(user);
    }

    private String sha256(String raw) {
        try {
            var md = java.security.MessageDigest.getInstance("SHA-256");
            return java.util.HexFormat.of().formatHex(md.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public boolean isDev() {
        for (String p : env.getActiveProfiles()) {
            if (p.equalsIgnoreCase("dev")) return true;
        }
        return false;
    }
}
