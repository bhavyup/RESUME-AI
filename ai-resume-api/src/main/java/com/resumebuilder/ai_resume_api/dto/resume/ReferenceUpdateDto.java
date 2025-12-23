package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Schema(description = "Update reference (optimistic locking)", example = """
        {
          "version": 1,
          "name": "Jane Smith",
          "title": "Project Manager",
          "company": "Tech Solutions Inc.",
          "relationship": "COLLEAGUE",
          "preferredContactMethod": "EMAIL",
          "email": "pJd2u@example.com",
          "phone": "+1 (123) 456-7890",
          "linkedinUrl": "https://www.linkedin.com/in/jane-smith",
          "websiteUrl": "https://www.example.com",
          "consentToShare": true,
          "visible": true,
          "relationshipNote": "Collaborator",
          "note": "Experienced project manager with a proven track record of success.",
          "lastVerifiedOn": "2023-08-15"
        }""")
public record ReferenceUpdateDto(
        @NotNull Long version,

        @Size(max = 255) String name,
        @Size(max = 255) String title,
        @Size(max = 255) String company,

        @Schema(allowableValues = {
                "MANAGER", "SUPERVISOR", "PEER", "COLLEAGUE", "DIRECT_REPORT", "CLIENT",
                "STAKEHOLDER", "PROFESSOR", "TEACHER", "MENTOR", "ADVISOR", "COACH", "OTHER"
        }) String relationship,

        @Schema(allowableValues = { "EMAIL", "PHONE", "LINKEDIN", "WEBSITE", "OTHER" }) String preferredContactMethod,

        @Email @Size(max = 320) String email,
        @Pattern(regexp = "^[+0-9().\\-\\s]{6,32}$", message = "Invalid phone format") @Size(max = 64) String phone,

        @Size(max = 2048) String linkedinUrl,
        @Size(max = 2048) String websiteUrl,

        Boolean consentToShare,
        Boolean visible,

        @Size(max = 255) String relationshipNote,
        @Size(max = 4000) String note,

        LocalDate lastVerifiedOn){
}