package com.resumebuilder.ai_resume_api.dto;

import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resume request data transfer object. Path: /resume")
public record PersonalInfoDto(
        String fullName,
        String professionalTitle,
        String resumeHeadline,
        String professionalSummary,
        String email,
        String phoneNumber,
        String city, 
        String state,
        String country,
        String zip,
        String preferredContactMethod,
        String linkedinUrl,
        String githubUrl,
        String websiteUrl,
        String twitterUrl,
        String instagramUrl,
        String telegramUrl,
        String facebookUrl,
        String whatsappUrl,
        List<String> targetRoles,
        String workPreference,
        String photoUrl,
        List<LanguageDto> languages,
        List<CustomLinkDto> links
) {}