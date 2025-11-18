package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Ollama request data transfer object. Path: /generate", example = "{\"model\": \"llama2\", \"prompt\": \"Generate a resume summary for a software engineer with 5 years of experience.\", \"stream\": false}")
public record OllamaRequestDto(String model, String prompt, boolean stream) {
}