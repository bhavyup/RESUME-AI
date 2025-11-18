package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Schema(description = "Create reference", example = """
        {
          "name": "Jane Smith",
          "title": "Project Manager",
          "company": "Tech Solutions Inc.",
          "relationship": "COLLEAGUE",
          "preferredContactMethod": "EMAIL",
          "email": "FtK4P@example.com",
          "phone": "+1 (123) 456-7890",
          "linkedinUrl": "https://linkedin.com/janesmith",
          "websiteUrl": "https://janesmith.com",
          "consentToShare": true,
          "visible": true,
          "relationshipNote": "Great colleague",
          "note": "Jane is a great colleague",
          "lastVerifiedOn": "2022-01-01"
        }""")
public record ReferenceRequestDto(
        @NotBlank(message = "Name is required") @Size(max = 255) String name,
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