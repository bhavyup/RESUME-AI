package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Request DTO for creating a project entry in a resume", example = """
          {
            "title": "AI Chatbot",
            "projectType": "PERSONAL",
            "role": "LEAD_DEV",
            "shortDescription": "Developed an AI-powered chatbot using NLP techniques.",
            "startDate": "2023-01-15",
            "endDate": "2023-06-30",
            "currentlyActive": false,
            "technologies": [
              "Python",
              "TensorFlow",
              "NLTK"
            ],
            "features": [
              "Natural language understanding",
              "Contextual responses",
              "Multi-language support"
            ],
            "links": [
              {
                "type": "REPO",
                "title": "GitHub Repository",
                "url": "https://github.com/bhavyupreti/ai-chatbot"
              },
              {
                "type": "DEMO",
                "title": "Live Demo",
                "url": "https://example.com/ai-chatbot-demo"
              }
            ],
            "media": [
              {
                "imageUrl": "https://example.com/images/chatbot-screenshot.png",
                "altText": "Screenshot of AI Chatbot",
                "thumbnailUrl": "https://example.com/images/chatbot-thumbnail.png"
              }
            ],
            "outcomeSummary": "The chatbot was successfully deployed and received positive feedback from users.",
            "downloadsCount": 100,
            "usersCount": 50,
            "starsCount": 10,
            "revenueImpactUsd": 5000.0,
            "licenseSpdx": "MIT",
            "licenseUrl": "https://opensource.org/licenses/MIT"
          }
        """)
public record ProjectRequestDto(
        @NotBlank(message = "Title is required") String title,

        @Schema(allowableValues = {
                "PERSONAL", "ACADEMIC", "OPEN_SOURCE", "FREELANCE", "COLLABORATIVE" }) @NotBlank(message = "Project Type is required") String projectType,

        @Schema(allowableValues = { "LEAD_DEV", "DATA_SCIENTIST", "PM", "DESIGNER", "ENGINEER", "QA", "DEVOPS",
                "OTHER" }) String role,

        String shortDescription,

        LocalDate startDate,
        LocalDate endDate,
        Boolean currentlyActive,

        List<String> technologies,
        List<String> features,

        List<ProjectLinkDto> links,
        List<ProjectMediaDto> media,

        String outcomeSummary,
        Long downloadsCount,
        Long usersCount,
        Long starsCount,
        BigDecimal revenueImpactUsd,

        String licenseSpdx,
        String licenseUrl){
}