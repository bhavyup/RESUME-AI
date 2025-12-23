package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Request DTO for updating a patent (optimistic locking)", example = """
        {
            "version": 1,
            "title": "Updated Patent Title",
            "patentNumber": "1234567",
            "applicationNumber": "12345678",
            "priorityNumber": "123456789",
            "pctNumber": "123456789",
            "filingDate": "2022-01-01",
            "grantDate": "2022-02-01",
            "publicationDate": "2022-03-01",
            "status": "FILED",
            "office": "USPTO",
            "jurisdictionCountry": "US",
            "kindCode": "A",
            "inventors": [
                "Inventor One",
                "Inventor Two"
            ],
            "assignees": [
                "Assignee One",
                "Assignee Two"
            ],
            "ipcClasses": [
                "A01B",
                "A01C"
            ],
            "cpcClasses": [
                "A01B",
                "A01C"
            ],
            "familyId": "FAM123456",
            "shortDescription": "A brief description of the patent.",
            "claimsSummary": "A summary of the claims in the patent.",
            "officialUrl": "https://example.com/patent/1234567",
            "links": [
                {
                    "type": "OFFICIAL",
                    "title": "Official Patent Link",
                    "url": "https://official.patent.link/1234567"
                },
                {
                    "type": "PDF",
                    "title": "Patent Document",
                    "url": "https://patents.example.com/1234567.pdf"
                }
            ]
        }
                """)
public record PatentUpdateDto(
        @NotNull Long version,

        @Size(max = 255) String title,

        @Size(max = 128) String patentNumber,
        @Size(max = 128) String applicationNumber,
        @Size(max = 128) String priorityNumber,
        @Size(max = 64) String pctNumber,

        LocalDate filingDate,
        LocalDate grantDate,
        LocalDate publicationDate,

        @Schema(allowableValues = {
                "FILED", "PENDING", "GRANTED", "EXPIRED", "ABANDONED", "WITHDRAWN" }) String status,

        @Schema(allowableValues = { "USPTO", "EPO", "WIPO", "JPO", "KIPO", "CNIPA", "UKIPO", "CIPO", "INPI", "DGIP",
                "OTHER" }) String office,

        @Pattern(regexp = "^[A-Z]{2,3}$", message = "jurisdictionCountry must be ISO alpha-2 or alpha-3") String jurisdictionCountry,

        @Size(max = 16) String kindCode,
        @Size(max = 64) String familyId,

        @Size(max = 4000) String shortDescription,
        @Size(max = 4000) String claimsSummary,

        @Size(max = 2048) String officialUrl,

        List<@Size(max = 128) String> inventors,
        List<@Size(max = 255) String> assignees,

        List<@Size(max = 32) String> ipcClasses,
        List<@Size(max = 32) String> cpcClasses,

        List<PatentLinkDto> links){
}