package com.resumebuilder.ai_resume_api.security;

import com.resumebuilder.ai_resume_api.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserUnlockScheduler {
    private final UserRepository userRepository;

    public UserUnlockScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void unlockUsers() {
        var now = java.time.Instant.now();
        var users = userRepository.findByAccountNonLockedFalseAndLockedUntilBefore(now);
        users.forEach(u -> {
            u.setAccountNonLocked(true);
            u.setLockedUntil(null);
            u.setFailedLoginAttempts(0);
        });
        userRepository.saveAll(users);
    }
}