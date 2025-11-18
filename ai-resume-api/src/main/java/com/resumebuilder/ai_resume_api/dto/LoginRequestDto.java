package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login request - accepts either email or username", example = "{\"username\": \"john@example.com\", \"password\": \"SecurePass123!\"}")
public record LoginRequestDto(
        @NotBlank(message = "Email or username is required") @Schema(description = "Email address or username", example = "john@example.com") String username,

        @NotBlank(message = "Password is required") @Schema(description = "User password", example = "SecurePass123!") String password) {
}