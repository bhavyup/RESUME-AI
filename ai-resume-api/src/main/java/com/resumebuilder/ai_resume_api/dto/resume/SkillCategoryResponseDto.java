package com.resumebuilder.ai_resume_api.dto.resume;

import java.util.List;

public record SkillCategoryResponseDto(
        Long id,
        Long version,
        String name,
        boolean isPredefined,
        List<SkillResponseDto> skills) {
}