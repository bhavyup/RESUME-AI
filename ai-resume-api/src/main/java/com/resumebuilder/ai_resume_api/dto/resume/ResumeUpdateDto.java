package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

@Schema(description = "Update DTO for Resume with optimistic locking")
public record ResumeUpdateDto(
        @NotNull @Schema(description = "Current entity version for optimistic locking", example = "3") Long version,

        @NotBlank(message = "Title is required") String title,
        @io.swagger.v3.oas.annotations.media.Schema(allowableValues = {
                "NUMERIC", "STRING" }) String skillProficiencyType,

        // top (mirrors your custom* fields in create request)
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

        // nested upserts
        List<LanguageUpdateDto> customLanguages,
        List<CustomLinkUpdateDto> customLinks){

    @Schema(description = "Update DTO for a resume language entry")
    public record LanguageUpdateDto(
            @Schema(description = "Existing id if updating; null to create") Long id,
            @Schema(description = "Current version for optimistic locking; required if id != null", example = "1") Long version,
            String languageName,
            @io.swagger.v3.oas.annotations.media.Schema(allowableValues = {
                    "ELEMENTARY", "LIMITED_WORKING", "PROFESSIONAL_WORKING", "FULL_PROFESSIONAL",
                    "NATIVE" }) String proficiency){
    }

    @Schema(description = "Update DTO for a resume custom link")
    public record CustomLinkUpdateDto(
            @Schema(description = "Existing id if updating; null to create") Long id,
            @Schema(description = "Current version for optimistic locking; required if id != null", example = "1") Long version,
            String title,
            String url) {
    }
}