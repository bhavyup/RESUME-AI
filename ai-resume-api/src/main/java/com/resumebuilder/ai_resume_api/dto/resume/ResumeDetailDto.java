package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;
import java.util.List;

public record ResumeDetailDto(
        Long id,
        String title,
        String skillProficiencyType,
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
        List<ExperienceDto> experiences,
        List<EducationDto> educations,
        List<SkillCategoryDto> skillCategories,
        List<SkillDto> uncategorizedSkills
) {
    public record ExperienceDto(
            Long id,
            String jobTitle,
            String companyName,
            String location,
            LocalDate startDate,
            LocalDate endDate,
            String description) {
    }

    public record EducationDto(
            Long id,
            String institution,
            String degree,
            String fieldOfStudy,
            String startDate,
            String endDate,
            List<String> courses,
            Double gpa,
            String description) {
    }

    public record SkillCategoryDto(
            Long id,
            String name,
            List<SkillDto> skills) {
    }

    public record SkillDto(
            Long id,
            String name,
            int proficiencyLevel,
            int categoryId,
            Integer yearsOfExperience,
            List<CertificationDto> certifications) {
    }

    public record CertificationDto(
            Long id,
            String name,
            String documentUrl,
            String url) {
    }
}