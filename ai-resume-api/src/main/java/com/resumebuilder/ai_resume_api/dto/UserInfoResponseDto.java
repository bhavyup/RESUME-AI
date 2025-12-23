package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User info data transfer object DTO. Path: /users/me", example = "{\"id\": 1, \"username\": \"johndoe\", \"email\": \"p8M4a@example.com\", \"fullName\": \"John Doe\", \"personalInfo\": {}}")
public record UserInfoResponseDto(
    Long id, String username, String email, String fullName, PersonalInfoDto personalInfo
) {
    
}
