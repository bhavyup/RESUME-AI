package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Custom link data transfer object. Path: /info", example = "{\"title\": \"GitHub\", \"url\": \"https://github.com\"}")
public record CustomLinkDto(Long id, @NotBlank(message = "Link title is required") String title, @NotBlank(message = "URL is required") String url) {}