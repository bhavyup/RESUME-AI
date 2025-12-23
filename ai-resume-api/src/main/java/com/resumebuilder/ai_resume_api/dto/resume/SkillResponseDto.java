package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;
import java.util.List;

public record SkillResponseDto(
        Long id,
        Long version,

        String name,

        int proficiencyLevel, // numeric (1-5)
        String proficiencyName, // named (NOVICE/INTERMEDIATE/ADVANCED/EXPERT)

        Integer yearsOfExperience,
        LocalDate lastUsed,
        boolean primary,

        Long categoryId, // reference instead of embedding category to avoid cycles

        List<String> keywords,
        List<CertificationResponseDto> certifications) {
}