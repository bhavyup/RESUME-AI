package com.resumebuilder.ai_resume_api.dto.resume;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Skill request data transfer object. Path: /resumes/{resumeId}/skills", example = """
        {
          "name": "Java Programming",
          "proficiencyLevel": 4,
          "proficiencyName": "ADVANCED",
          "yearsOfExperience": 3,
          "lastUsed": "2023-12-01",
          "primary": true,
          "categoryId": 1,
          "keywords": [
            "Java",
            "Spring Boot",
            "Hibernate"
          ],
          "certifications": [
            {
              "id": 1,
              "name": "Oracle Certified Professional, Java SE 11 Developer",
              "url": "https://www.oracle.com/certification/java-se-11-developer/",
              "documentUrl": "https://example.com/certificates/ocp-java-se11.pdf"
            }
          ]
        }
        """)
public record SkillRequestDto(
        @NotBlank(message = "Skill name is required") String name,

        // Numeric proficiency (1-5). Used when resume.skillProficiencyType = NUMERIC
        @Min(value = 1, message = "Proficiency level must be positive") @Max(value = 5, message = "Proficiency level must be between 1 and 5") Integer proficiencyLevel,

        // Named proficiency (NOVICE/INTERMEDIATE/ADVANCED/EXPERT). Used when
        // resume.skillProficiencyType = STRING
        @Schema(allowableValues = {
                "NOVICE", "INTERMEDIATE", "ADVANCED", "EXPERT" }) String proficiencyName,

        Integer yearsOfExperience, // Optional

        LocalDate lastUsed, // Optional

        Boolean primary, // Optional

        Long categoryId, // Optional: for linking to a category

        List<String> keywords, // Optional ATS keywords / aliases

        List<CertificationDto> certifications // Optional
    ){
    public record CertificationDto(
            Long id,
            @NotBlank(message = "Certification name is required") String name,
            String url,
            String documentUrl) {
    }
}