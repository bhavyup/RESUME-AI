package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Update a talk (optimistic locking)", example = """
                {
                  "version": 1,
                  "title": "Building Scalable Applications with AWS",
                  "eventName": "Tech Conference 2023",
                  "organizer": "Tech Events Inc.",
                  "track": "Cloud Computing",
                  "type": "TALK",
                  "role": "SPEAKER",
                  "status": "DELIVERED",
                  "startDate": "2023-09-15",
                  "endDate": "2023-09-15",
                  "isVirtual": false,
                  "venue": "Convention Center",
                  "city": "San Francisco",
                  "region": "CA",
                  "country": "USA",
                  "language": "English",
                  "audienceSize": 150,
                  "slidesUrl": "https://example.com/slides",
                  "videoUrl": "https://example.com/video",
                  "eventUrl": "https://techconference2023.com",
                  "coverImageUrl": "https://example.com/cover.jpg",
                  "abstractText": "An overview of building scalable applications using AWS services.",
                  "description": "In this talk, we will explore various AWS services and best practices for building scalable applications.",
                  "notes": "Remember to engage with the audience during Q&A.",
                  "coSpeakers": ["Jane Doe", "John Smith"],
                  "keywords": ["AWS", "Cloud", "Scalability"],
                  "links": [
                    {
                      "type": "SLIDES",
                      "title": "Presentation Slides",
                      "url": "https://example.com/slides"
                    },
                    {
                      "type": "VIDEO",
                      "title": "Recorded Video",
                      "url": "https://example.com/video"
                    }
                  ]
                }
        """)
public record TalkUpdateDto(
        @NotNull Long version,

        @Size(max = 255) String title,
        @Size(max = 255) String eventName,
        @Size(max = 255) String organizer,
        @Size(max = 255) String track,

        @Schema(allowableValues = {
                "TALK", "WORKSHOP", "PANEL", "KEYNOTE", "WEBINAR", "POSTER", "LIGHTNING", "DEMO"
        }) String type,

        @Schema(allowableValues = {
                "SPEAKER", "CO_SPEAKER", "PANELIST", "MODERATOR", "HOST", "ORGANIZER", "TRAINER"
        }) String role,

        @Schema(allowableValues = {
                "SCHEDULED", "DELIVERED", "CANCELLED", "POSTPONED"
        }) String status,

        LocalDate startDate,
        LocalDate endDate,

        Boolean isVirtual,
        @Size(max = 255) String venue,
        @Size(max = 128) String city,
        @Size(max = 128) String region,
        @Size(max = 128) String country,

        @Size(max = 64) String language,
        @PositiveOrZero Integer audienceSize,

        @Size(max = 2048) String slidesUrl,
        @Size(max = 2048) String videoUrl,
        @Size(max = 2048) String eventUrl,
        @Size(max = 2048) String coverImageUrl,

        @Size(max = 4000) String abstractText,
        @Size(max = 4000) String description,
        @Size(max = 4000) String notes,

        List<@Size(max = 128) String> coSpeakers,
        List<@Size(max = 64) String> keywords,
        List<TalkLinkDto> links){
}