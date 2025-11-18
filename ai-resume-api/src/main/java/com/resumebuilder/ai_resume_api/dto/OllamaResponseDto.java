package com.resumebuilder.ai_resume_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OllamaResponseDto(String response) {
}