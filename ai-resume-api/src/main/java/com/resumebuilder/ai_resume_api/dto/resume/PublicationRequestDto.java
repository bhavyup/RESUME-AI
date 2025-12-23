package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Request DTO for creating or updating a publication", example = """
                {
                    "title": "Deep Learning for AI",
                    "publicationType": "JOURNAL",
                    "status": "PUBLISHED",
                    "venue": "Journal of AI Research",
                    "publisher": "AI Publishers",
                    "dateYearMonth": "2023-05",
                    "peerReviewed": true,
                    "doi": "10.1000/j.jair.2023.01",
                    "arxivId": "arXiv:2301.12345",
                    "ssrnId": "SSRN1234567",
                    "pubmedId": "PMID12345678",
                    "isbn": "978-3-16-148410-0",
                    "url": "https://example.com/publication",
                    "abstractText": "This paper explores deep learning techniques for artificial intelligence.",
                    "summary": "A comprehensive overview of deep learning methods in AI.",
                    "citationCount": 150,
                    "presentationTitle": "Deep Learning in AI Conference",
                    "presentationType": "TALK",
                    "eventName": "AI Conference 2023",
                    "eventLocationCity": "San Francisco",
                    "eventLocationCountry": "USA",
                    "presentationDate": "2023-06-15",
                    "volume": "42",
                    "issue": "3",
                    "pages": "123-145",
                    "authors": [
                        "Alice Smith",
                        "Bob Johnson"
                    ],
                    "keywords": [
                        "Deep Learning",
                        "Artificial Intelligence",
                        "Neural Networks"
                    ]
                }
                """)
public record PublicationRequestDto(
                @NotBlank(message = "Title is required") @Size(max = 512) String title,

                @Schema(allowableValues = {
                                "JOURNAL", "CONFERENCE", "PREPRINT", "BOOK", "CHAPTER", "ARTICLE", "PATENT", "THESIS",
                                "REPORT", "OTHER" }) String publicationType,

                @Schema(allowableValues = { "PUBLISHED", "ACCEPTED", "IN_REVIEW", "SUBMITTED", "DRAFT",
                                "REJECTED" }) String status,

                @Size(max = 255) String venue,
                @Size(max = 255) String publisher,

                // YYYY or YYYY-MM
                @Pattern(regexp = "^[0-9]{4}(-[0-9]{2})?$", message = "dateYearMonth must be 'YYYY' or 'YYYY-MM'") String dateYearMonth,

                Boolean peerReviewed,

                // identifiers
                @Size(max = 255) String doi,
                @Size(max = 64) String arxivId,
                @Size(max = 64) String ssrnId,
                @Size(max = 64) String pubmedId,
                @Size(max = 32) String isbn,
                @Size(max = 2048) String url,

                @Size(max = 2000) String abstractText,
                @Size(max = 512) String summary,

                @PositiveOrZero Integer citationCount,

                // presentation
                @Size(max = 255) String presentationTitle,
                @Schema(allowableValues = { "TALK", "POSTER", "KEYNOTE" }) String presentationType,
                @Size(max = 255) String eventName,
                @Size(max = 128) String eventLocationCity,
                @Size(max = 128) String eventLocationCountry,
                LocalDate presentationDate,

                @Size(max = 64) String volume,
                @Size(max = 64) String issue,
                @Size(max = 64) String pages,

                @NotEmpty List<@Size(max = 128) String> authors,
                List<@Size(max = 64) String> keywords){
}