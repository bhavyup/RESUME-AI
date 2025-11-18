package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Update volunteer/leadership/community entry (optimistic locking)", example = """
                {
                  "version": 1,
                  "title": "Volunteer Teacher",
                  "organization": "Local Community Center",
                  "type": "TEACHING",
                  "status": "COMPLETED",
                  "engagementMode": "IN_PERSON",
                  "cause": "EDUCATION",
                  "startDate": "2021-01-15",
                  "endDate": "2021-12-15",
                  "hours": 150.5,
                  "city": "Springfield",
                  "region": "IL",
                  "country": "USA",
                  "orgWebsiteUrl": "https://communitycenter.org",
                  "coverImageUrl": "https://example.com/cover.jpg",
                  "description": "Taught basic computer skills to underprivileged children.",
                  "notes": "Received appreciation from the community.",
                  "responsibilities": [
                    "Developed lesson plans",
                    "Conducted weekly classes"
                  ],
                  "impacts": [
                    "Improved computer literacy among participants"
                  ],
                  "mentees": [
                    "John Doe",
                    "Jane Smith"
                  ],
                  "events": [
                    "Annual Tech Fair 2021"
                  ],
                  "teachingTopics": [
                    "Basic Computing",
                    "Internet Safety"
                  ],
                  "keywords": [
                    "Teaching",
                    "Community Service",
                    "Education"
                  ],
                  "referenceUrls": [
                    "https://linkedin.com/in/volunteerteacher"
                  ],
                  "links": [
                    {
                      "type": "ORG",
                      "title": "Community Center",
                      "url": "https://communitycenter.org"
                    },
                    {
                      "type": "EVENT",
                      "title": "Tech Fair 2021",
                      "url": "https://techfair2021.org"
                    }
                  ]
                }
        """)
public record VolunteeringUpdateDto(
        @NotNull Long version,

        @Size(max = 255) String title,
        @Size(max = 255) String organization,

        @Schema(allowableValues = {
                "VOLUNTEER", "LEADERSHIP", "MENTORING", "ORGANIZING", "TEACHING", "TUTORING", "COACHING", "PRO_BONO",
                "COMMUNITY" }) String type,

        @Schema(allowableValues = { "ONGOING", "COMPLETED", "PLANNED", "PAUSED" }) String status,

        @Schema(allowableValues = { "IN_PERSON", "VIRTUAL", "HYBRID" }) String engagementMode,

        @Schema(allowableValues = { "EDUCATION", "ENVIRONMENT", "HEALTH", "ANIMALS", "TECHNOLOGY", "ARTS", "SPORTS",
                "COMMUNITY", "HUMAN_RIGHTS", "DISASTER_RELIEF", "OTHER" }) String cause,

        LocalDate startDate,
        LocalDate endDate,

        @Digits(integer = 8, fraction = 2) @PositiveOrZero BigDecimal hours,

        @Size(max = 128) String city,
        @Size(max = 128) String region,
        @Size(max = 128) String country,

        @Size(max = 2048) String orgWebsiteUrl,
        @Size(max = 2048) String coverImageUrl,

        @Size(max = 4000) String description,
        @Size(max = 4000) String notes,

        List<@Size(max = 255) String> responsibilities,
        List<@Size(max = 255) String> impacts,
        List<@Size(max = 128) String> mentees,
        List<@Size(max = 255) String> events,
        List<@Size(max = 128) String> teachingTopics,
        List<@Size(max = 64) String> keywords,
        List<@Size(max = 2048) String> referenceUrls,

        List<VolunteerLinkDto> links){
}