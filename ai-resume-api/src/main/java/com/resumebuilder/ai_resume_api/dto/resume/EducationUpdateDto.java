package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Schema(description = "Update DTO for Education with optimistic locking", example = """
        {
            "version": 1,
            "institution": "University of California, Berkeley",
            "institutionWebsite": "https://berkeley.edu",
            "degree": "Bachelor of Science",
            "fieldOfStudy": "Computer Science",
            "locationCity": "Berkeley",
            "locationCountry": "United States",
            "startDate": "2009",
            "endDate": "2013",
            "graduationDate": "2013",
            "expectedGraduation": false,
            "currentlyEnrolled": false,
            "courses": [
                "Data Structures and Algorithms",
                "Operating Systems",
                "Database Management Systems",
                "Artificial Intelligence"
            ],
            "gpa": 3.8,
            "showGpa": true,
            "honors": "Summa Cum Laude",
            "showHonors": true,
            "gradeClass": "Cum Laude",
            "description": "Graduated with honors",
            "awards": [
                "Dean's List (2010, 2011, 2012, 2013)",
                "Undergraduate Research Award (2012)"
            ],
            "projects": [
                {
                  "title": "Senior Thesis: Machine Learning for Healthcare",
                  "url": "  https://example.com/senior-thesis"
                }
            ]


            """)
public record EducationUpdateDto(
        @NotNull @Schema(description = "Current version for optimistic locking", example = "3") Long version,

        @NotBlank(message = "Institution is required") String institution,
        String institutionWebsite,

        @NotBlank(message = "Degree is required") String degree,
        String fieldOfStudy,

        String locationCity,
        String locationCountry,

        String startDate,
        String endDate,

        String graduationDate,
        Boolean expectedGraduation,
        Boolean currentlyEnrolled,

        List<String> courses,

        Double gpa,
        Boolean showGpa,

        String honors,
        Boolean showHonors,
        String gradeClass,

        String description,

        List<String> awards,
        List<EducationProjectLinkDto> projects) {
}