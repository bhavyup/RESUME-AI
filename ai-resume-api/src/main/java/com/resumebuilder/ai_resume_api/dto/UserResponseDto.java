package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User data transfer object DTO. Path: /auth/register", example = "{\"id\": 1, \"username\": \"johndoe\", \"email\": \"p8M4a@example.com\", \"fullName\": \"John Doe\", \"createdAt\": \"2023-10-01T12:00:00Z\", \"updatedAt\": \"2023-10-01T12:00:00Z\"}")
public record UserResponseDto(
    Long id, String username, String email, String fullName, java.time.Instant createdAt, java.time.Instant updatedAt
) {}
