package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Schema(description = "Education create DTO. Path: /api/resumes/{resumeId}/educations", example = """
        {
          "institution": "University of Example",
          "institutionWebsite": "https://www.exampleuniversity.edu",
          "degree": "Bachelor of Science",
          "fieldOfStudy": "Computer Science",
          "locationCity": "Example City",
          "locationCountry": "Example Country",
          "startDate": "2020-09",
          "endDate": "2024-06",
          "graduationDate": "2024-06",
          "expectedGraduation": false,
          "currentlyEnrolled": false,
          "courses": [
            "Data Structures and Algorithms",
            "Operating Systems",
            "Database Management Systems"
          ],
          "gpa": 3.8,
          "showGpa": true,
          "honors": "Magna Cum Laude",
          "showHonors": true,
          "gradeClass": null,
          "description": "Focused on software development and data science.",
          "awards": [
            "Dean's List 2020-2024",
            "Undergraduate Research Award 2023"
          ],
          "projects": [
            {
              "title": "AI Chatbot",
              "url": "https://example.com/ai-chatbot"
            },
            {
               "title": "Personal Portfolio Website",
               "url": "https://example.com/portfolio"
            }
          ]
        }
            """)
public record EducationDto(
        @NotBlank(message = "Institution is required") String institution,
        String institutionWebsite,

        @NotBlank(message = "Degree is required") String degree,
        String fieldOfStudy,

        String locationCity,
        String locationCountry,

        // store as YYYY-MM or YYYY (free-form to match existing pattern)
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