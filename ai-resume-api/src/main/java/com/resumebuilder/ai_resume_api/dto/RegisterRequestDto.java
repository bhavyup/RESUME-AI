package com.resumebuilder.ai_resume_api.dto;

import com.resumebuilder.ai_resume_api.validation.StrongPassword;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Register request data transfer object", example = "{\"username\": \"johndoe\", \"email\": \"p8M4a@example.com\", \"password\": \"password\", \"fullName\": \"John Doe\"}")
public record RegisterRequestDto(
        @NotBlank @Size(min = 3, max = 32) @Pattern(regexp = "^[a-z0-9._-]{3,32}$", message = "Username can contain lowercase letters, digits, . _ -") String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 256) @StrongPassword String password,
        @NotBlank @Size(min = 3, max = 100) String fullName) {
}
