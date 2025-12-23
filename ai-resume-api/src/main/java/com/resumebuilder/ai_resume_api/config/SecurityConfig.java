package com.resumebuilder.ai_resume_api.config;

import com.resumebuilder.ai_resume_api.exception.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
        @Value("${app.docs.enabled:false}")
        private boolean docsEnabled;

        private final JwtAuthenticationFilter jwtFilter;
        private final AuthenticationProvider authenticationProvider;
        private final RestAuthenticationEntryPoint restEntryPoint;
        private final AccessDeniedHandler accessDeniedHandler;

        public SecurityConfig(
                        JwtAuthenticationFilter jwtFilter,
                        AuthenticationProvider authenticationProvider,
                        RestAuthenticationEntryPoint restEntryPoint,
                        AccessDeniedHandler accessDeniedHandler) {
                this.jwtFilter = jwtFilter;
                this.authenticationProvider = authenticationProvider;
                this.restEntryPoint = restEntryPoint;
                this.accessDeniedHandler = accessDeniedHandler;
        }

        @Bean
        SecurityFilterChain filterChain(HttpSecurity http)
                        throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))
                                .cors(Customizer.withDefaults())
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(restEntryPoint)
                                                .accessDeniedHandler(accessDeniedHandler))
                                .authorizeHttpRequests(auth -> {
                                        if (docsEnabled) {
                                                auth.requestMatchers(
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**",
                                                                "/webjars/**").permitAll();
                                        }
                                        auth.requestMatchers("/api/auth/**", "/auth/**", "/actuator/health",
                                                        "/actuator/info").permitAll();
                                        auth.requestMatchers("/oauth2/**",  "/api/webhooks/stripe").permitAll();
                                        auth.requestMatchers(org.springframework.http.HttpMethod.GET,
                                                        "/api/ai/resumes/*/bullets/rewrite/stream").permitAll();

                                        // Token mint endpoint requires normal auth
                                        auth.requestMatchers(org.springframework.http.HttpMethod.POST,
                                                        "/api/ai/resumes/*/bullets/rewrite/stream-token")
                                                        .authenticated();
                                        auth.anyRequest().authenticated();
                                })
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);
                if (docsEnabled) {
                        // relaxed CSP for dev so Swagger UI JS/CSS can load
                        http.headers(h -> h
                                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                                        "default-src 'self'; " +
                                                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                                                                        +
                                                                        "style-src 'self' 'unsafe-inline'; " +
                                                                        "img-src 'self' data:; " +
                                                                        "font-src 'self' data:; " +
                                                                        "connect-src 'self' ws:;"))
                                        .referrerPolicy(r -> r
                                                        .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
                                        .httpStrictTransportSecurity(
                                                        hsts -> hsts.includeSubDomains(true).preload(true)
                                                                        .maxAgeInSeconds(31536000)));
                } else {
                        // the strict CSP for non-dev (your previous one)
                        http.headers(h -> h
                                        .contentSecurityPolicy(
                                                        csp -> csp.policyDirectives(
                                                                        "default-src 'none'; base-uri 'none'; frame-ancestors 'none'"))
                                        .referrerPolicy(r -> r.policy(
                                                        org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
                                        .httpStrictTransportSecurity(
                                                        hsts -> hsts.includeSubDomains(true).preload(true)
                                                                        .maxAgeInSeconds(31536000)));
                }
                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource(
                        @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins}") String allowed) {
                var cfg = new CorsConfiguration();
                cfg.setAllowedOrigins(java.util.List.of(allowed.split(",")));
                cfg.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
                cfg.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                cfg.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));
                cfg.setExposedHeaders(java.util.List.of("Authorization"));
                cfg.setAllowCredentials(true);
                var source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", cfg);
                return source;
        }
}