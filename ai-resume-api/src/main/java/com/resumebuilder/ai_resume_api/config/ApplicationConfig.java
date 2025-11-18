package com.resumebuilder.ai_resume_api.config;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // <-- Make sure this import is present
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory; // Add this import

@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;

    public ApplicationConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return identifier -> {
            // Normalize input
            String normalized = identifier == null ? null : identifier.trim().toLowerCase();

            if (normalized == null || normalized.isBlank()) {
                throw new UsernameNotFoundException("Identifier cannot be empty");
            }

            // Determine if identifier is email or username
            boolean isEmail = normalized.contains("@");

            UserEntity user;
            if (isEmail) {
                // Login with email
                user = userRepository.findByEmail(normalized)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            } else {
                // Login with username
                user = userRepository.findByUsername(normalized)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            }

            return com.resumebuilder.ai_resume_api.security.UserPrincipal.from(user);
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder(
            @org.springframework.beans.factory.annotation.Value("${security.password.encoder:BCrypt}") String enc) {
        PasswordEncoder primary = "Argon2".equalsIgnoreCase(enc)
                ? new org.springframework.security.crypto.argon2.Argon2PasswordEncoder(16, 32, 1, 1 << 13, 3)
                : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
        PasswordEncoder fallback = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);
        return new com.resumebuilder.ai_resume_api.security.CompositePasswordEncoder(primary, fallback);
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public RestTemplate restTemplate() {
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(15000);
        return new RestTemplate(factory);
    }
}