package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;
import java.util.List;

public record PublicationResponseDto(
                Long id,
                Long version,

                String title,
                String publicationType,
                String status,

                String venue,
                String publisher,

                String dateYearMonth,
                boolean peerReviewed,

                String doi,
                String arxivId,
                String ssrnId,
                String pubmedId,
                String isbn,
                String url,

                String abstractText,
                String summary,

                Integer citationCount,

                String presentationTitle,
                String presentationType,
                String eventName,
                String eventLocationCity,
                String eventLocationCountry,
                LocalDate presentationDate,

                String volume,
                String issue,
                String pages,

                List<String> authors,
                List<String> keywords) {
}