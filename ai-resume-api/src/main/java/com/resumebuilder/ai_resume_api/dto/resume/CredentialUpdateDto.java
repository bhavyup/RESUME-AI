package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Update certification/license (optimistic locking)", example = """
                {
                  "version": 1,
                  "name": "AWS Certified Solutions Architect",
                  "type": "CERTIFICATION",
                  "issuer": "Amazon Web Services",
                  "issuerUrl": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
                  "issueDate": "2022-05-15",
                  "expiryDate": "2023-05-15",
                  "doesNotExpire": false,
                  "credentialId": "1234567890",
                  "credentialUrl": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
                  "score": 5.0,
                  "scoreUnit": "%",
                  "level": "Associate",
                  "status": "ACTIVE",
                  "description": "AWS Certified Solutions Architect - Associate",
                  "badgeImageUrl": "https://example.com/badge.png",
                  "keywords": [
                    "AWS",
                    "Cloud",
                    "Solutions Architect"
                  ]
        """)
public record CredentialUpdateDto(
        @NotNull Long version,

        @Size(max = 255) String name,

        @Schema(allowableValues = {
                "CERTIFICATION", "LICENSE" }) String type,

        @Size(max = 255) String issuer,
        @Size(max = 1024) String issuerUrl,

        LocalDate issueDate,
        LocalDate expiryDate,
        Boolean doesNotExpire,

        @Size(max = 128) String credentialId,
        @Size(max = 2048) String credentialUrl,

        @Digits(integer = 8, fraction = 2) @PositiveOrZero BigDecimal score,
        @Size(max = 32) String scoreUnit,
        @Size(max = 128) String level,

        @Schema(allowableValues = { "ACTIVE", "EXPIRED", "REVOKED", "SUSPENDED", "PENDING" }) String status,

        @Size(max = 2000) String description,
        @Size(max = 2048) String badgeImageUrl,

        List<@Size(max = 64) String> keywords){
}