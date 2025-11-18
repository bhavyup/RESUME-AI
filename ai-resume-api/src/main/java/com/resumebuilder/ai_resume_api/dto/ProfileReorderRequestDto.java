package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(description = "Reorder request for profile sections (no version needed)")
public record ProfileReorderRequestDto(
        @NotEmpty(message = "orderedIds cannot be empty") List<Long> orderedIds) {
}