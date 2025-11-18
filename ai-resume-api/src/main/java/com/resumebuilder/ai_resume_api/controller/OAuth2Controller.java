package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.service.JwtService;
import com.resumebuilder.ai_resume_api.service.RefreshTokenService;
import com.resumebuilder.ai_resume_api.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/oauth2")
public class OAuth2Controller {
        private static final Logger log = LoggerFactory.getLogger(OAuth2Controller.class);

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final RefreshTokenService refreshTokenService;
        private final PasswordEncoder passwordEncoder;
        private final RestTemplate restTemplate;

        @Value("${spring.security.oauth2.client.registration.github.client-id}")
        private String githubClientId;

        @Value("${spring.security.oauth2.client.registration.github.client-secret}")
        private String githubClientSecret;

        @Value("${spring.security.oauth2.client.registration.google.client-id}")
        private String googleClientId;

        @Value("${spring.security.oauth2.client.registration.google.client-secret}")
        private String googleClientSecret;

        @Value("${application.frontend.url}")
        private String frontendUrl;

        @Value("${security.cookies.secure:false}")
        private boolean cookiesSecure;

        @Value("${security.cookies.same-site:Lax}")
        private String sameSite;

        public OAuth2Controller(
                        UserRepository userRepository,
                        JwtService jwtService,
                        RefreshTokenService refreshTokenService,
                        PasswordEncoder passwordEncoder,
                        RestTemplate restTemplate) {
                this.userRepository = userRepository;
                this.jwtService = jwtService;
                this.refreshTokenService = refreshTokenService;
                this.passwordEncoder = passwordEncoder;
                this.restTemplate = restTemplate;
        }

        // ==================== GITHUB OAUTH ====================

        @Operation(summary = "Initiate GitHub OAuth", description = "Redirects to GitHub authorization page")
        @GetMapping("/authorize/github")
        public void authorizeGithub(HttpServletResponse response) throws IOException {
                String authUrl = String.format(
                                "https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=user:email",
                                githubClientId,
                                "http://localhost:8080/oauth2/callback/github");
                response.sendRedirect(authUrl);
        }

        @Operation(summary = "GitHub OAuth callback", description = "Handles GitHub OAuth callback")
        @GetMapping("/callback/github")
        public void githubCallback(
                        @RequestParam("code") String code,
                        HttpServletRequest request,
                        HttpServletResponse response) throws IOException {

                // Exchange code for access token
                String tokenUrl = "https://github.com/login/oauth/access_token";
                Map<String, String> tokenRequest = Map.of(
                                "client_id", githubClientId,
                                "client_secret", githubClientSecret,
                                "code", code);

                HttpHeaders headers = new HttpHeaders();
                headers.set("Accept", "application/json");
                HttpEntity<Map<String, String>> entity = new HttpEntity<>(tokenRequest, headers);

                ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, entity, Map.class);
                String accessToken = (String) tokenResponse.getBody().get("access_token");

                // Fetch user info
                String userInfoUrl = "https://api.github.com/user";
                HttpHeaders userHeaders = new HttpHeaders();
                userHeaders.set("Authorization", "Bearer " + accessToken);
                HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

                ResponseEntity<Map> userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET, userEntity,
                                Map.class);
                Map<String, Object> userInfo = userResponse.getBody();

                // Fetch email if not public
                String email = (String) userInfo.get("email");
                if (email == null || email.isEmpty()) {
                        String emailUrl = "https://api.github.com/user/emails";
                        ResponseEntity<Map[]> emailResponse = restTemplate.exchange(emailUrl, HttpMethod.GET,
                                        userEntity,
                                        Map[].class);
                        Map[] emails = emailResponse.getBody();
                        if (emails != null) {
                                for (Map emailObj : emails) {
                                        if (Boolean.TRUE.equals(emailObj.get("primary"))) {
                                                email = (String) emailObj.get("email");
                                                break;
                                        }
                                }
                        }
                }

                // Create or find user
                UserEntity user = findOrCreateOAuthUser(
                                email,
                                (String) userInfo.get("login"), // username from GitHub
                                (String) userInfo.get("name") // full name
                );

                // Generate tokens and redirect
                redirectWithTokens(user, request, response);
        }

        // ==================== GOOGLE OAUTH ====================

        @Operation(summary = "Initiate Google OAuth", description = "Redirects to Google authorization page")
        @GetMapping("/authorize/google")
        public void authorizeGoogle(HttpServletResponse response) throws IOException {
                String redirectUri = "http://localhost:8080/oauth2/callback/google";

                String authUrl = String.format(
                                "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&access_type=offline&prompt=consent",
                                googleClientId,
                                java.net.URLEncoder.encode(redirectUri, java.nio.charset.StandardCharsets.UTF_8),
                                java.net.URLEncoder.encode("email profile", java.nio.charset.StandardCharsets.UTF_8));

                log.info("🔵 Initiating Google OAuth");
                log.info("📝 Redirect URI: {}", redirectUri);
                log.info("🔗 Authorization URL: {}", authUrl);

                response.sendRedirect(authUrl);
        }

        @Operation(summary = "Google OAuth callback", description = "Handles Google OAuth callback")
        @GetMapping("/callback/google")
        public void googleCallback(
                        @RequestParam("code") String code,
                        HttpServletRequest request,
                        HttpServletResponse response) throws IOException {

                log.info("🔵 Google OAuth callback received");
                log.info("📝 Authorization code: {}...", code.substring(0, Math.min(20, code.length())));

                String tokenUrl = "https://oauth2.googleapis.com/token";
                String redirectUri = "http://localhost:8080/oauth2/callback/google";

                log.info("🔧 Token exchange config:");
                log.info("  - Token URL: {}", tokenUrl);
                log.info("  - Redirect URI: {}", redirectUri);
                log.info("  - Client ID: {}...", googleClientId.substring(0, Math.min(20, googleClientId.length())));
                log.info("  - Client Secret: {}...",
                                googleClientSecret.substring(0, Math.min(10, googleClientSecret.length())));

                // Create form-encoded request body
                MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
                formData.add("code", code);
                formData.add("client_id", googleClientId);
                formData.add("client_secret", googleClientSecret);
                formData.add("redirect_uri", redirectUri);
                formData.add("grant_type", "authorization_code");

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
                headers.setAccept(Collections.singletonList(org.springframework.http.MediaType.APPLICATION_JSON));

                HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

                log.info("📤 Sending token exchange request to Google...");

                try {
                        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, entity, Map.class);

                        log.info("✅ Token exchange successful! Status: {}", tokenResponse.getStatusCode());

                        @SuppressWarnings("unchecked")
                        Map<String, Object> tokenBody = tokenResponse.getBody();
                        String accessToken = (String) tokenBody.get("access_token");
                        log.info("🎫 Access token received: {}...",
                                        accessToken.substring(0, Math.min(20, accessToken.length())));

                        // Fetch user info
                        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
                        HttpHeaders userHeaders = new HttpHeaders();
                        userHeaders.set("Authorization", "Bearer " + accessToken);
                        HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

                        log.info("📤 Fetching user info from Google...");
                        ResponseEntity<Map> userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.GET,
                                        userEntity, Map.class);

                        @SuppressWarnings("unchecked")
                        Map<String, Object> userInfo = userResponse.getBody();

                        log.info("✅ User info received for: {}", userInfo.get("email"));

                        // Create or find user
                        UserEntity user = findOrCreateOAuthUser(
                                        (String) userInfo.get("email"),
                                        (String) userInfo.get("email"), // use email as username
                                        (String) userInfo.get("name"));

                        log.info("✅ User created/found: {}", user.getEmail());

                        // Generate tokens and redirect
                        redirectWithTokens(user, request, response);

                } catch (HttpClientErrorException e) {
                        log.error("❌ Google token exchange failed!");
                        log.error("   Status: {}", e.getStatusCode());

                        String responseBody = e.getResponseBodyAsString();
                        log.error("   Response body: {}", responseBody.isEmpty() ? "[EMPTY]" : responseBody);

                        if (e.getResponseHeaders() != null) {
                                log.error("   Response headers: {}", e.getResponseHeaders());
                        }

                        log.error("   Request details:");
                        log.error("     - Client ID used: {}", googleClientId);
                        log.error("     - Client Secret length: {}", googleClientSecret.length());
                        log.error("     - Redirect URI: {}", redirectUri);
                        log.error("     - Code length: {}", code.length());

                        log.error("   Common causes:");
                        log.error("     1. Client ID/Secret don't match Google Cloud Console");
                        log.error("     2. OAuth client is not 'Web application' type");
                        log.error("     3. Redirect URI not configured in Google Console");
                        log.error("     4. Using credentials from wrong Google Cloud project");

                        throw e;
                }
        }

        // ==================== HELPER METHODS ====================

        private UserEntity findOrCreateOAuthUser(String email, String username, String fullName) {
                // Normalize email
                email = email.toLowerCase().trim();

                // Try to find by email first
                UserEntity user = userRepository.findByEmail(email).orElse(null);

                if (user == null) {
                        // Generate a valid username from email/username
                        String baseUsername = generateValidUsername(username, email);

                        // Ensure uniqueness
                        String validUsername = ensureUniqueUsername(baseUsername);

                        log.info("🔧 Generated username: {} from email: {}", validUsername, email);

                        // Create new user
                        user = new UserEntity();
                        user.setEmail(email);
                        user.setUsername(validUsername);
                        user.setFullName(fullName != null ? fullName : username);
                        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password
                        user.setEnabled(true); // OAuth users are auto-verified

                        user = userRepository.save(user);
                        log.info("✅ Created new OAuth user: {} with username: {}", email, validUsername);
                } else {
                        log.info("✅ Found existing user: {}", email);
                }

                return user;
        }

        /**
         * Generate a valid username from email or username.
         * Ensures compliance with constraint: ^[a-z0-9._-]{3,32}$
         */
        private String generateValidUsername(String username, String email) {
                String baseUsername;

                // If username contains @, extract the local part (before @)
                if (username != null && username.contains("@")) {
                        baseUsername = username.substring(0, username.indexOf("@"));
                } else if (username != null && !username.isEmpty()) {
                        baseUsername = username;
                } else {
                        // Fallback to email local part
                        baseUsername = email.substring(0, email.indexOf("@"));
                }

                // Convert to lowercase and remove invalid characters
                // Keep only: a-z, 0-9, ., _, -
                baseUsername = baseUsername.toLowerCase()
                                .replaceAll("[^a-z0-9._-]", "_") // Replace invalid chars with underscore
                                .replaceAll("[._-]{2,}", "_") // Replace consecutive special chars with single
                                                              // underscore
                                .replaceAll("^[._-]+|[._-]+$", ""); // Remove leading/trailing special chars

                // Ensure minimum length (at least 3 characters)
                if (baseUsername.length() < 3) {
                        baseUsername = baseUsername + "_user";
                }

                // Ensure maximum length (32 characters max)
                if (baseUsername.length() > 32) {
                        baseUsername = baseUsername.substring(0, 32);
                }

                return baseUsername;
        }

        /**
         * Check if username already exists, if so append a number
         */
        private String ensureUniqueUsername(String baseUsername) {
                String username = baseUsername;
                int attempt = 1;

                while (userRepository.findByUsername(username).isPresent()) {
                        // Username exists, try with number suffix
                        String suffix = String.valueOf(attempt);
                        int maxBaseLength = 32 - suffix.length() - 1; // -1 for underscore

                        if (baseUsername.length() > maxBaseLength) {
                                username = baseUsername.substring(0, maxBaseLength) + "_" + suffix;
                        } else {
                                username = baseUsername + "_" + suffix;
                        }

                        attempt++;

                        // Prevent infinite loop (very unlikely)
                        if (attempt > 999) {
                                username = baseUsername.substring(0, 26) + "_"
                                                + UUID.randomUUID().toString().substring(0, 5);
                                break;
                        }
                }

                return username;
        }

        private void redirectWithTokens(UserEntity user, HttpServletRequest request, HttpServletResponse response)
                        throws IOException {
                // Generate access token
                String accessToken = jwtService.generateAccessToken(
                                user.getId(),
                                user.getUsername(),
                                user.getAuthorities());

                // Generate refresh token
                var refreshToken = refreshTokenService.issue(
                                user,
                                request.getRemoteAddr(),
                                request.getHeader("User-Agent"));

                // Set refresh token cookie
                var cookie = CookieUtil.httpOnlyCookie(
                                "refresh_token",
                                refreshToken.getTokenHash(),
                                14 * 24 * 3600,
                                cookiesSecure,
                                sameSite,
                                "/");
                response.addHeader("Set-Cookie", CookieUtil.buildSetCookieHeader(cookie, sameSite));

                // Redirect to frontend with access token
                String redirectUrl = String.format(
                                "%s/auth/callback?token=%s&expiresIn=%d",
                                frontendUrl,
                                accessToken,
                                jwtService.getExpiresInSeconds());

                log.info("🔀 Redirecting to frontend: {}", redirectUrl);
                response.sendRedirect(redirectUrl);
        }
}