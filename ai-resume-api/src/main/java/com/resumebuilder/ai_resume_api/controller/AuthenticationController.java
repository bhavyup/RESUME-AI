package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.dto.LoginRequestDto;
import com.resumebuilder.ai_resume_api.dto.LoginResponseDto;
import com.resumebuilder.ai_resume_api.dto.RegisterRequestDto;
import com.resumebuilder.ai_resume_api.dto.UserResponseDto;
import com.resumebuilder.ai_resume_api.service.JwtService;
import com.resumebuilder.ai_resume_api.service.UserService;
import com.resumebuilder.ai_resume_api.util.Normalization;

import io.swagger.v3.oas.annotations.Operation;

import com.resumebuilder.ai_resume_api.service.EmailVerificationService;
import com.resumebuilder.ai_resume_api.security.AccessTokenBlocklist;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.resumebuilder.ai_resume_api.service.RefreshTokenService refreshTokenService;
    private final com.resumebuilder.ai_resume_api.repository.UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    private final AccessTokenBlocklist accessTokenBlocklist;

    @org.springframework.beans.factory.annotation.Value("${security.cookies.secure:false}")
    private boolean cookiesSecure;

    @org.springframework.beans.factory.annotation.Value("${security.cookies.same-site:Lax}") // Lax for same-site, None
                                                                                             // if cross-site
    private String sameSite;

    public AuthenticationController(UserService userService,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            com.resumebuilder.ai_resume_api.service.RefreshTokenService refreshTokenService,
            com.resumebuilder.ai_resume_api.repository.UserRepository userRepository,
            EmailVerificationService emailVerificationService, AccessTokenBlocklist accessTokenBlocklist) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.emailVerificationService = emailVerificationService;
        this.accessTokenBlocklist = accessTokenBlocklist;
    }

    @Operation(summary = "Register a new user", description = "Registers a new user. Returns 201 Created on success. Future use: email verification.")
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequestDto req) {
        var dto = userService.register(req);
        String token = emailVerificationService.issue(userRepository.findById(dto.id()).orElseThrow());
        if (emailVerificationService.isDev()) {
            log.info("Verification token for {}: {}", dto.email(), token);
        }
        return ResponseEntity.status(201).body(dto);
    }

    @Operation(summary = "Login a user", description = "Logs in a user with email or username. Returns access token (JWT) and refresh token (cookie).")
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        // Log login attempt (without password!)
        String identifier = Normalization.username(request.username());
        boolean isEmail = identifier.contains("@");
        log.info("Login attempt - Type: {}, Identifier: {}, IP: {}",
                isEmail ? "EMAIL" : "USERNAME",
                identifier,
                httpRequest.getRemoteAddr());

        var normalized = Normalization.username(request.username());
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalized, request.password()));
        var principal = (com.resumebuilder.ai_resume_api.security.UserPrincipal) auth.getPrincipal();

        // Access token
        String jwtToken = jwtService.generateAccessToken(principal.getId(), principal.getUsername(),
                principal.getAuthorities());

        // Refresh token cookie
        var user = userRepository.findById(principal.getId()).orElseThrow();
        var rt = refreshTokenService.issue(user, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));
        var cookie = com.resumebuilder.ai_resume_api.util.CookieUtil.httpOnlyCookie("refresh_token", rt.getTokenHash(),
                14 * 24 * 3600, cookiesSecure, sameSite, "/");
        httpResponse.addHeader("Set-Cookie",
                com.resumebuilder.ai_resume_api.util.CookieUtil.buildSetCookieHeader(cookie, sameSite));

        log.info("Login successful - User ID: {}, Username: {}", principal.getId(), principal.getUsername());

        return ResponseEntity.ok(new LoginResponseDto(jwtToken, jwtService.getExpiresInSeconds()));
    }

    @Operation(summary = "Refresh a user's access token", description = "Refreshes a user's access token. Returns 200 OK on success.")
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refresh(jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        String raw = null;
        if (httpRequest.getCookies() != null) {
            for (var c : httpRequest.getCookies()) {
                if ("refresh_token".equals(c.getName())) {
                    raw = c.getValue();
                    break;
                }
            }
        }
        if (raw == null || raw.isBlank()) {
            return ResponseEntity.status(401).build();
        }
        var rotated = refreshTokenService.rotate(raw, httpRequest.getRemoteAddr(), httpRequest.getHeader("User-Agent"));

        // Re-issue cookie
        var cookie = com.resumebuilder.ai_resume_api.util.CookieUtil.httpOnlyCookie("refresh_token",
                rotated.getTokenHash(), 14 * 24 * 3600, cookiesSecure, sameSite, "/");
        httpResponse.addHeader("Set-Cookie",
                com.resumebuilder.ai_resume_api.util.CookieUtil.buildSetCookieHeader(cookie, sameSite));

        // var rtHash = refreshTokenService.sha256(rotated.getTokenHash()); //
        var user = rotated.getUser();
        String access = jwtService.generateAccessToken(user.getId(), user.getUsername(), java.util.List.of());
        return ResponseEntity.ok(new LoginResponseDto(access, jwtService.getExpiresInSeconds()));
    }

    @Operation(summary = "Logout a user", description = "Logs out a user. Revokes the access token(jWT) and the refresh token(cookie). Returns 204 No Content on success.")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String jti = jwtService.extractJti(token);
                java.time.Instant exp = jwtService.extractExpiration(token);
                if (jti != null && exp != null) {
                    accessTokenBlocklist.revoke(jti, exp);
                }
            } catch (io.jsonwebtoken.JwtException ignored) {
                // invalid token; nothing to revoke
            }
        }

        // Existing refresh token revoke + clear cookie
        String raw = null;
        if (httpRequest.getCookies() != null) {
            for (var c : httpRequest.getCookies()) {
                if ("refresh_token".equals(c.getName())) {
                    raw = c.getValue();
                    break;
                }
            }
        }
        if (raw != null) {
            refreshTokenService.revoke(raw);
            var clear = com.resumebuilder.ai_resume_api.util.CookieUtil.httpOnlyCookie("refresh_token", "", 0,
                    cookiesSecure, sameSite, "/");
            httpResponse.addHeader("Set-Cookie",
                    com.resumebuilder.ai_resume_api.util.CookieUtil.buildSetCookieHeader(clear, sameSite));
        }
        return ResponseEntity.noContent().build();
    }
}