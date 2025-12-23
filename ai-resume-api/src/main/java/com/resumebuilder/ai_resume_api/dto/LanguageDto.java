package com.resumebuilder.ai_resume_api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Language data transfer object. Path: /info", example = "{\"languageName\": \"Spanish\", \"proficiency\": \"Fluent\"}")
public record LanguageDto(Long id, @NotBlank(message = "Language name is required") @JsonAlias({"languageName", "language", "name"}) String language, @NotBlank(message = "Proficiency is required") @JsonAlias({"proficiency", "level", "proficiencyLevel"}) String proficiencyLevel) {}