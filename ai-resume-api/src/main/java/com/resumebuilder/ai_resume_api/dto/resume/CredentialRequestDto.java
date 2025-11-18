package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Create certification/license", example = """
                {
                  "name": "AWS Certified Solutions Architect",
                  "type": "CERTIFICATION",
                  "issuer": "Amazon Web Services",
                  "issuerUrl": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
                  "issueDate": "2022-05-15",
                  "expiryDate": "2025-05-15",
                  "doesNotExpire": false,
                  "credentialId": "ABC123456",
                  "credentialUrl": "https://www.youracclaim.com/badges/abc123456",
                  "score": 92.5,
                  "scoreUnit": "percentage",
                  "level": "Associate",
                  "status": "ACTIVE",
                  "description": "Earners of the AWS Certified Solutions Architect - Associate certification demonstrate knowledge of how to architect and deploy secure and robust applications on AWS technologies.",
                  "badgeImageUrl": "https://images.youracclaim.com/images/abc123456.png",
                  "keywords": ["AWS", "Cloud", "Solutions Architect"]
                }
                """)
public record CredentialRequestDto(
                @NotBlank(message = "Name is required") @Size(max = 255) String name,

                @Schema(allowableValues = {
                                "CERTIFICATION", "LICENSE" }) String type,

                @NotBlank(message = "Issuer is required") @Size(max = 255) String issuer,
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