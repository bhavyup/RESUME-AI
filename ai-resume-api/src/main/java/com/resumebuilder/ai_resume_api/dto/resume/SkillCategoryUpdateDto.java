package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Update DTO for Skill Category with optimistic locking")
public record SkillCategoryUpdateDto(
        @NotNull @Schema(description = "Current version for optimistic locking", example = "1") Long version,
        @NotBlank(message = "Name is required") String name) {
}