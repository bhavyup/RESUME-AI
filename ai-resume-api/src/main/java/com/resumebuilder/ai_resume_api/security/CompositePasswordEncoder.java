package com.resumebuilder.ai_resume_api.security;

import org.springframework.security.crypto.password.PasswordEncoder;

public class CompositePasswordEncoder implements PasswordEncoder {
    private final PasswordEncoder primary;
    private final PasswordEncoder fallback;

    public CompositePasswordEncoder(PasswordEncoder primary, PasswordEncoder fallback) {
        this.primary = primary;
        this.fallback = fallback;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return primary.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null)
            return false;
        if (primary.matches(rawPassword, encodedPassword))
            return true;
        return fallback.matches(rawPassword, encodedPassword);
    }
}
