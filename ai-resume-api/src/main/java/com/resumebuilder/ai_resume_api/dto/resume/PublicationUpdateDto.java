package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "PublicationUpdateDto", example = """
        {
          "version": 1,
          "title": "Deep Learning for AI",
          "publicationType": "JOURNAL",
          "status": "PUBLISHED",
          "venue": "International Journal of AI Research",
          "publisher": "Tech Publishers",
          "dateYearMonth": "2023-05",
          "peerReviewed": true,
          "doi": "10.1234/ijair.2023.56789",
          "arxivId": "arXiv:2305.12345",
          "ssrnId": "SSRN1234567",
          "pubmedId": "PMID12345678",
          "isbn": "978-3-16-148410-0",
          "url": "https://example.com/publication",
          "abstractText": "This paper explores deep learning techniques...",
          "summary": "A comprehensive study on deep learning applications.",
          "citationCount": 150,
          "presentationTitle": "Deep Learning in Modern AI",
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
public record PublicationUpdateDto(
        @NotNull Long version,

        @Size(max = 512) String title,

        @Schema(allowableValues = {
                "JOURNAL", "CONFERENCE", "PREPRINT", "BOOK", "CHAPTER", "ARTICLE", "PATENT", "THESIS", "REPORT",
                "OTHER" }) String publicationType,

        @Schema(allowableValues = { "PUBLISHED", "ACCEPTED", "IN_REVIEW", "SUBMITTED", "DRAFT",
                "REJECTED" }) String status,

        @Size(max = 255) String venue,
        @Size(max = 255) String publisher,

        @Pattern(regexp = "^[0-9]{4}(-[0-9]{2})?$", message = "dateYearMonth must be 'YYYY' or 'YYYY-MM'") String dateYearMonth,

        Boolean peerReviewed,

        @Size(max = 255) String doi,
        @Size(max = 64) String arxivId,
        @Size(max = 64) String ssrnId,
        @Size(max = 64) String pubmedId,
        @Size(max = 32) String isbn,
        @Size(max = 2048) String url,

        @Size(max = 2000) String abstractText,
        @Size(max = 512) String summary,

        @PositiveOrZero Integer citationCount,

        @Size(max = 255) String presentationTitle,
        @Schema(allowableValues = { "TALK", "POSTER", "KEYNOTE" }) String presentationType,
        @Size(max = 255) String eventName,
        @Size(max = 128) String eventLocationCity,
        @Size(max = 128) String eventLocationCountry,
        LocalDate presentationDate,

        @Size(max = 64) String volume,
        @Size(max = 64) String issue,
        @Size(max = 64) String pages,

        List<@Size(max = 128) String> authors,
        List<@Size(max = 64) String> keywords){
}