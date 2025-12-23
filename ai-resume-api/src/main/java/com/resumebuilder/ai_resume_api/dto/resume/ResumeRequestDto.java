package com.resumebuilder.ai_resume_api.dto.resume;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Resume request data transfer object. Path: /resume", example = "{\"title\": \"Software Engineer Resume\", \"skillProficiencyType\": \"INTEGER\", \"customFullName\": \"John Doe\", \"customProfessionalTitle\": \"Software Engineer\", \"customEmail\": \"p8M4a@example.com\", \"customPhoneNumber\": \"1234567890\", \"customCity\": \"New York\", \"customCountry\": \"USA\", \"customState\": \"NY\", \"customZip\": \"10001\", \"customLinkedinUrl\": \"https://linkedin.com/in/johndoe\", \"customGithubUrl\": \"https://github.com/johndoe\", \"customWebsiteUrl\": \"https://johndoe.com\", \"customResumeHeadline\": \"Experienced developer...\", \"customPreferredContactMethod\": \"Email\", \"customWorkPreference\": \"Remote\", \"customPhotoUrl\": \"https://example.com/photo.jpg\", \"customTargetRoles\": [\"Software Engineer\", \"Backend Developer\"], \"customProfessionalSummary\": \"A highly skilled software engineer with over 5 years of experience...\", \"customLanguages\": [{\"id\": 1, \"languageName\": \"English\", \"proficiency\": \"Native\"}, {\"id\": 2, \"languageName\": \"Spanish\", \"proficiency\": \"Professional Working Proficiency\"}], \"customLinks\": [{\"id\": 1, \"title\": \"Portfolio\", \"url\": \"https://johndoe.com/portfolio\"}, {\"id\": 2, \"title\": \"Blog\", \"url\": \"https://johndoe.com/blog\"}]}")
public record ResumeRequestDto(
                @NotBlank(message = "Title is required") String title,
                String resumeType,
                Long baseResumeId,
                String jobDescription,
                Boolean applyPatches, // true = auto-apply AI suggestions
                List<Integer> selectedPatches,
                @io.swagger.v3.oas.annotations.media.Schema(allowableValues = {
                                "NUMERIC", "STRING" }) String skillProficiencyType,
                String customFullName,
                String customEmail,
                String customPhoneNumber,
                String customCity,
                String customCountry,
                String customState,
                String customZip,
                String customLinkedinUrl,
                String customGithubUrl,
                String customTwitterUrl,
                String customFacebookUrl,
                String customWhatsappUrl,
                String customInstagramUrl,
                String customTelegramUrl,
                String customWebsiteUrl,
                String customResumeHeadline,
                String customPreferredContactMethod,
                String customWorkPreference,
                String customPhotoUrl,
                List<String> customTargetRoles,
                String customProfessionalSummary,
                List<LanguageDto> customLanguages,
                List<CustomLinkDto> customLinks){
        @Schema(description = "Language DTO used in ResumeRequestDto", example = "{\"id\": 1, \"languageName\": \"English\", \"proficiency\": \"Native\"}")
        public record LanguageDto(Long id, @NotBlank(message = "Language name is required") String languageName,
                        @NotBlank(message = "Proficiency is required") String proficiency) {
        }

        @Schema(description = "Custom Link DTO used in ResumeRequestDto", example = "{\"id\": 1, \"title\": \"Portfolio\", \"url\": \"https://johndoe.com/portfolio\"}")
        public record CustomLinkDto(Long id, @NotBlank(message = "Title is required") String title,
                        @NotBlank(message = "URL is required") String url) {
        }
}