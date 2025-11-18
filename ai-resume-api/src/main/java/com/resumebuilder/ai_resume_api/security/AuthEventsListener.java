package com.resumebuilder.ai_resume_api.security;

import com.resumebuilder.ai_resume_api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
public class AuthEventsListener {
    private static final Logger log = LoggerFactory.getLogger(AuthEventsListener.class);
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private final UserRepository userRepository;

    public AuthEventsListener(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @EventListener
    @Transactional
    public void onFailure(AuthenticationFailureBadCredentialsEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof String raw) {
            String username = raw.trim().toLowerCase();
            userRepository.findByUsername(username).ifPresent(user -> {
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);
                if (attempts >= MAX_ATTEMPTS) {
                    user.setAccountNonLocked(false);
                    user.setLockedUntil(Instant.now().plusSeconds(LOCK_MINUTES * 60));
                    log.warn("User {} locked until {}", username, user.getLockedUntil());
                }
                userRepository.save(user);
            });
        }
    }

    @EventListener
    @Transactional
    public void onSuccess(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if (principal instanceof com.resumebuilder.ai_resume_api.security.UserPrincipal up) {
            userRepository.findById(up.getId()).ifPresent(user -> {
                user.setFailedLoginAttempts(0);
                if (user.getLockedUntil() != null && user.getLockedUntil().isBefore(Instant.now())) {
                    user.setAccountNonLocked(true);
                    user.setLockedUntil(null);
                }
                userRepository.save(user);
            });
        }
    }
}