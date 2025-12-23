package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Update DTO for Skill with optimistic locking; supports nested certification upserts", example = """
    {
      "version": 4,
      "name": "Java Programming",
      "proficiencyLevel": 5,
      "proficiencyName": "EXPERT",
      "yearsOfExperience": 6,
      "lastUsed": "2024-12-01",
      "primary": true,
      "categoryId": 2,
      "certifications": [
        {
          "id": 10,
          "version": 2,
          "name": "Oracle Certified Professional, Java SE 11 Developer",
          "url": "https://www.oracle.com/certification/certified-professional-java-se-11-developer/",
          "documentUrl": "https://example.com/certificates/ocpj11.pdf"
        },
        {
          "id": null,
          "version": null,
          "name": "AWS Certified Developer - Associate",
          "url": "https://aws.amazon.com/certification/certified-developer-associate/",
          "documentUrl": "https://example.com/certificates/aws-dev-assoc.pdf"
        }
      ],
      "keywords": [
        "Java",
        "Database"
      ]
    }""")
public record SkillUpdateDto(
    @NotNull @Schema(description = "Current version for optimistic locking", example = "4") Long version,

    @NotBlank(message = "Name is required") String name,

    // Numeric proficiency (1-5)
    @NotNull(message = "Proficiency Level is required") Integer proficiencyLevel,

    // Named proficiency (NOVICE/INTERMEDIATE/ADVANCED/EXPERT)
    @Schema(allowableValues = {
        "NOVICE", "INTERMEDIATE", "ADVANCED", "EXPERT" }) String proficiencyName,

    Integer yearsOfExperience,
    LocalDate lastUsed,
    Boolean primary,

    Long categoryId, // nullable to clear

    List<CertificationUpdateDto> certifications,

    List<String> keywords){
  @Schema(description = "Update DTO for certification; id+version for update; null id to create")
  public record CertificationUpdateDto(
      Long id,
      Long version,
      String name,
      String url,
      String documentUrl) {
  }
}