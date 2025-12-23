package com.resumebuilder.ai_resume_api.dto.resume;

import java.util.List;

public record EducationResponseDto(
        Long id,
        Long version,

        String degree,
        String fieldOfStudy,

        String institution,
        String institutionWebsite,

        String locationCity,
        String locationCountry,

        String startDate,
        String endDate,

        String graduationDate,
        boolean expectedGraduation,
        boolean currentlyEnrolled,

        List<String> courses,

        Double gpa,
        boolean showGpa,

        String honors,
        boolean showHonors,
        String gradeClass,

        String description,

        List<String> awards,
        List<EducationProjectLinkDto> projects) {
}