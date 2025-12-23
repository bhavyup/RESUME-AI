package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Suggestion request data transfer object. Path: /api/ai/experiences/suggestions", example = "{\"jobTitle\": \"Software Engineer\", \"descriptionDraft\": \"Experienced in Java and Spring Boot...\"}")   
public record SuggestionRequestDto(String jobTitle, String descriptionDraft) {
}