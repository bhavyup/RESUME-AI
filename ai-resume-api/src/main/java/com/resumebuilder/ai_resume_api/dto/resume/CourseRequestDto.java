package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Create course/online learning", example = """
        {
          "title": "Machine Learning",
          "provider": "Stanford University",
          "platform": "Coursera",
          "startDate": "2023-01-15",
          "endDate": "2023-04-15",
          "completionDate": "2023-04-15",
          "hours": 60.5,
          "credentialId": "ML-COURSE-2023",
          "credentialUrl": "https://www.coursera.org/account/accomplishments/certificate/ML-COURSE-2023",
          "certificateUrl": "https://www.coursera.org/account/accomplishments/certificate/ML-COURSE-2023",
          "grade": "A",
          "score": 95.0,
          "scoreUnit": "percentage",
          "level": "ADVANCED",
          "deliveryMode": "ONLINE",
          "status": "COMPLETED",
          "description": "An in-depth course on machine learning covering algorithms, data mining, and statistical pattern recognition.",
          "notes": "Completed with distinction.",
          "instructors": ["Andrew Ng"],
          "topics": ["Machine Learning", "AI", "Data Science"],
          "links": [
            {
              "type": "SYLLABUS",
              "title": "Course Syllabus",
              "url": "https://www.coursera.org/learn/machine-learning/syllabus"
            },
            {
              "type": "PROJECT",
              "title": "Final Project Repository",
              "url": "https://github.com/username/project"
            }
          ]
        }
        """)
public record CourseRequestDto(
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String provider,
        @Size(max = 128) String platform,

        LocalDate startDate,
        LocalDate endDate,
        LocalDate completionDate,

        @Digits(integer = 4, fraction = 2) @PositiveOrZero BigDecimal hours,

        @Size(max = 128) String credentialId,
        @Size(max = 2048) String credentialUrl,
        @Size(max = 2048) String certificateUrl,

        @Size(max = 64) String grade,
        @Digits(integer = 8, fraction = 2) @PositiveOrZero BigDecimal score,
        @Size(max = 32) String scoreUnit,

        @Schema(allowableValues = {
                "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT" }) String level,
        @Schema(allowableValues = { "ONLINE", "OFFLINE", "BLENDED" }) String deliveryMode,
        @Schema(allowableValues = { "COMPLETED", "IN_PROGRESS", "PLANNED", "EXPIRED" }) String status,

        @Size(max = 4000) String description,
        @Size(max = 4000) String notes,

        List<@Size(max = 128) String> instructors,
        List<@Size(max = 255) String> topics,
        List<CourseLinkDto> links){
}