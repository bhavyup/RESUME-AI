package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.service.EmailVerificationService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class EmailVerificationController {
    private final EmailVerificationService emailVerificationService;

    public EmailVerificationController(EmailVerificationService svc) {
        this.emailVerificationService = svc;
    }

    @Operation(summary = "Verify an email", description = "Verifies an email token. Returns 204 No Content on success.")
    @PostMapping("/verify-email")
    public ResponseEntity<Void> verify(@RequestParam("token") String token) {
        emailVerificationService.verify(token);
        return ResponseEntity.noContent().build();
    }
}
