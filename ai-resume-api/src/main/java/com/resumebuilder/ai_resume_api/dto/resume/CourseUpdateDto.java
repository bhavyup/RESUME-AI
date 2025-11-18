package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Update course details", example = """
        {
          "version": 1,
          "title": "Introduction to Machine Learning",
          "provider": "Coursera",
          "platform": "Online",
          "startDate": "2023-01-15",
          "endDate": "2023-03-15",
          "completionDate": "2023-03-15",
          "hours": 40.0,
          "credentialId": "ML123456",
          "credentialUrl": "https://www.coursera.org/account/accomplishments/certificate/ML123456",
          "certificateUrl": "https://www.coursera.org/account/accomplishments/certificate/ML123456.pdf",
          "grade": "A",
          "score": 95.0,
          "scoreUnit": "percentage",
          "level": "BEGINNER",
          "deliveryMode": "ONLINE",
          "status": "COMPLETED",
          "description": "A comprehensive introduction to machine learning concepts and techniques.",
          "notes": "Completed with distinction.",
          "instructors": ["Dr. John Doe", "Prof. Jane Smith"],
          "topics": ["Machine Learning", "Data Science", "AI"],
          "links": [
            {
              "type": "SYLLABUS",
              "title": "Course Syllabus",
              "url": "https://www.coursera.org/learn/machine-learning/syllabus"
            },
            {
              "type": "PROJECT",
              "title": "Final Project Repository",
              "url": "https://github.com/user/project"
            }
          ]
        }""")
public record CourseUpdateDto(
        @NotNull Long version,

        @Size(max = 255) String title,
        @Size(max = 255) String provider,
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