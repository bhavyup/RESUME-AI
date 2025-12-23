package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.Instant;
import java.util.List;

public record ResumeResponseDto(
                Long id,
                Long version,

                // Add these fields to the existing record
                String resumeType,
                Long baseResumeId,
                String jobDescription,

                String title,
                String skillProficiencyType,

                String fullName,
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

                List<ResumeCustomLinkResponseDto> links,
                List<String> targetRoles,
                String workPreference,
                String photoUrl,

                boolean referencesOnRequest,

                List<ResumeLanguageResponseDto> languages,
                List<SkillCategoryResponseDto> skillCategories,
                List<SkillResponseDto> skills,
                List<ExperienceResponseDto> experiences,
                List<EducationResponseDto> educations,
                List<ProjectResponseDto> projects,
                List<AwardResponseDto> awards,
                List<PublicationResponseDto> publications,
                List<PatentResponseDto> patents,
                List<CredentialResponseDto> credentials,
                List<CourseResponseDto> courses,
                List<TalkResponseDto> talks,
                List<VolunteeringResponseDto> volunteerings,
                List<ReferenceResponseDto> references,

                Long userId, // parent identity for convenience
                Instant createdAt,
                Instant updatedAt) {
}