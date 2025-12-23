package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Skill Category data transfer object", example = "{\"name\": \"Programming Languages\"}")
public record SkillCategoryDto(@NotBlank(message = "Category name is required") String name) {}