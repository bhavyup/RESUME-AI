package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Login response data transfer object. Path: /auth/login", example = "{\"jwtToken\": \"token...\", \"expiresInSeconds\": 3600}")
public record LoginResponseDto(String jwtToken, long expiresInSeconds) {}