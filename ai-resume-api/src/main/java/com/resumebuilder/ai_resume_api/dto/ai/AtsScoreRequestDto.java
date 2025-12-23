package com.resumebuilder.ai_resume_api.dto.ai;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "ATS scoring request. Either pass resumeText directly, or we will add resume extraction in a later step.", example = """
        {
          "jobTitle": "Software Engineer",
          "jobDescription": "We are looking for a skilled Software Engineer to join our team. The ideal candidate will have experience with Java, Spring Boot, and RESTful APIs. Responsibilities include developing high-quality software solutions, collaborating with cross-functional teams, and participating in code reviews.",
          "resumeText": "John Doe is a Software Engineer with 5 years of experience in Java and Spring Boot. He has worked on various projects involving RESTful APIs and microservices architecture. John is proficient in Agile methodologies and has a strong background in computer science.",
          "targetKeywords": ["Java", "Spring Boot", "RESTful APIs", "Microservices", "Agile"],
          "model": "primary"
        }
        """)
public record AtsScoreRequestDto(
        @NotBlank @Size(max = 128) String jobTitle,
        @NotBlank @Size(max = 20000) String jobDescription,

        // For v1 we accept resumeText directly for simplicity.
        @NotBlank @Size(max = 30000) String resumeText,

        // Optional: provide your own target keywords to override extraction
        List<String> targetKeywords,

        // Optional: choose model routing key (primary/secondary/fallback/tiny or raw
        // id)
        String model) {
}