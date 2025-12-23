package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Create volunteer/leadership/community entry", example = """
        {
            "title": "Volunteer",
            "organization": "Organization",
            "type": "VOLUNTEER",
            "status": "ONGOING",
            "engagementMode": "IN_PERSON",
            "cause": "EDUCATION",
            "startDate": "2022-01-01",
            "endDate": "2022-12-31",
            "hours": 20.0,
            "city": "City",
            "region": "Region",
            "country": "Country",
            "description": "Description",
            "notes": "Notes",
            "links": [
                {
                    "type": "ORG",
                    "title": "Organization Website",
                    "url": "https://www.organization.org"
                },
                {
                    "type": "EVENT",
                    "title": "Event Page",
                    "url": "https://www.event.com"
                }
            ],
            "orgWebsiteUrl": "https://www.organization.org",
            "coverImageUrl": "https://www.organization.org/image.jpg",
            "responsibilities": ["Responsibility 1", "Responsibility 2"],
            "impacts": ["Impact 1", "Impact 2"],
            "mentees": ["Mentee 1", "Mentee 2"],
            "events": ["Event 1", "Event 2"],
            "teachingTopics": ["Topic 1", "Topic 2"],
            "keywords": ["Keyword1", "Keyword2"],
            "referenceUrls": ["https://www.reference1.com", "https://www.reference2.com"]
        }
            """)
public record VolunteeringRequestDto(
        @NotBlank(message = "Title is required") @Size(max = 255) String title,
        @NotBlank(message = "Organization is required") @Size(max = 255) String organization,

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