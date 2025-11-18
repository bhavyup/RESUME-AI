package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Schema(description = "Create Award/Honor/Scholarship", example = """
        {
            "title": "Best Research Paper",
            "issuer": "International Science Association",
            "issuerUrl": "https://www.scienceassociation.org/awards/best-research-paper",
            "dateReceived": "2023-05-15",
            "description": "Awarded for outstanding research in the field of AI.",
            "monetaryAmountUsd": 5000.00,
            "currencyCode": "USD",
            "awardType": "AWARD",
            "linkTitle": "Award Details",
            "linkUrl": "https://www.scienceassociation.org/awards/details"
        }
        """)
public record AwardRequestDto(
        @NotBlank(message = "Title is required") @Size(max = 255) String title,
        @NotBlank(message = "Issuer is required") @Size(max = 255) String issuer,
        @Size(max = 1024) String issuerUrl,

        LocalDate dateReceived,

        @Size(max = 2000) String description,

        @Digits(integer = 17, fraction = 2) @PositiveOrZero BigDecimal monetaryAmountUsd,

        @Pattern(regexp = "^[A-Z]{3}$", message = "currencyCode must be 3-letter ISO 4217 (e.g., USD)") String currencyCode,

        @Schema(allowableValues = {
                "AWARD", "HONOR", "SCHOLARSHIP" }) String awardType,

        @Size(max = 255) String linkTitle,
        @Size(max = 2048) String linkUrl){
}