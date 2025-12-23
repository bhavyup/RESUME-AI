package com.resumebuilder.ai_resume_api.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "Resume request data transfer object. Path: /info", example = "{\"fullName\": \"John Doe\", \"professionalTitle\": \"Software Engineer\", \"resumeHeadline\": \"Experienced developer...\", \"professionalSummary\": \"A highly skilled software engineer with over 5 years of experience...\", \"email\": \"p8M4a@example.com\", \"phoneNumber\": \"1234567890\", \"city\": \"New York\", \"state\": \"NY\", \"country\": \"USA\", \"zip\": \"10001\", \"preferredContactMethod\": \"Email\", \"linkedinUrl\": \"https://linkedin.com/in/johndoe\", \"githubUrl\": \"https://github.com/johndoe\", \"websiteUrl\": \"https://johndoe.com\", \"twitterUrl\": \"https://twitter.com/johndoe\", \"instagramUrl\": \"https://instagram.com/johndoe\", \"telegramUrl\": \"https://t.me/johndoe\", \"facebookUrl\": \"https://facebook.com/johndoe\", \"whatsappUrl\": \"https://wa.me/1234567890\", \"targetRoles\": [\"Software Engineer\", \"Backend Developer\"], \"workPreference\": \"Remote\", \"photoUrl\": \"https://example.com/photo.jpg\", \"languages\": [{\"language\": \"English\", \"proficiencyLevel\": \"Native\"}, {\"language\": \"Spanish\", \"proficiencyLevel\": \"Professional Working Proficiency\"}], \"links\": [{\"title\": \"Portfolio\", \"url\": \"https://johndoe.com/portfolio\"}, {\"title\": \"Blog\", \"url\": \"https://johndoe.com/blog\"}]}")
public record PersonalInfoRequestDto(
                @NotBlank(message = "Full name is required") @Size(max = 100) String fullName,
                @Size(max = 100) String professionalTitle,
                @Size(max = 140) String resumeHeadline,
                @Size(max = 8000) String professionalSummary,
                @NotBlank(message = "Email is required") @Email @Size(max = 255) String email,
                @Size(max = 32) String phoneNumber,
                @Size(max = 128) String city,
                @Size(max = 128) String state,
                @Size(max = 128) String country,
                @Size(max = 32) String zip,
                @Size(max = 64) String preferredContactMethod,
                @Size(max = 255) String linkedinUrl,
                @Size(max = 255) String githubUrl,
                @Size(max = 255) String websiteUrl,
                @Size(max = 255) String twitterUrl,
                @Size(max = 255) String instagramUrl,
                @Size(max = 255) String telegramUrl,
                @Size(max = 255) String facebookUrl,
                @Size(max = 255) String whatsappUrl,
                List<String> targetRoles,
                @Size(max = 32) String workPreference,
                @Size(max = 1024) String photoUrl,
                List<@Valid LanguageDto> languages,
                List<@Valid CustomLinkDto> links) {
}