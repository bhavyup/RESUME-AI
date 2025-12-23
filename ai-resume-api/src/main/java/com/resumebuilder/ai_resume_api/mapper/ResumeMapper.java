package com.resumebuilder.ai_resume_api.mapper;

import com.resumebuilder.ai_resume_api.dto.resume.*;
import com.resumebuilder.ai_resume_api.entity.resume.*;
import com.resumebuilder.ai_resume_api.entity.profile.*;
import com.resumebuilder.ai_resume_api.entity.embedded.ExperienceLink;
import com.resumebuilder.ai_resume_api.enums.EmploymentType;
import com.resumebuilder.ai_resume_api.enums.LanguageProficiency;
import com.resumebuilder.ai_resume_api.enums.SkillProficiencyType;
import com.resumebuilder.ai_resume_api.enums.SeniorityLevel;
import org.mapstruct.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Mapper(componentModel = "spring", config = MapStructCentralConfig.class)
public interface ResumeMapper {

    // Top-level mapping
    @Mapping(target = "userId", source = "user.id")
    ResumeResponseDto toResponseDto(ResumeEntity resume);

    List<ResumeResponseDto> toResponseDtoList(List<ResumeEntity> resumes);

    // Nested: languages
    ResumeLanguageResponseDto toDto(ResumeLanguageEntity e);

    List<ResumeLanguageResponseDto> toLanguageDtoList(List<ResumeLanguageEntity> list);

    // Nested: links
    ResumeCustomLinkResponseDto toDto(ResumeCustomLinkEntity e);

    List<ResumeCustomLinkResponseDto> toLinkDtoList(List<ResumeCustomLinkEntity> list);

    // Nested: certifications
    CertificationResponseDto toDto(CertificationEntity e);

    List<CertificationResponseDto> toCertDtoList(List<CertificationEntity> list);

    // SKills
    @Mappings({
            @Mapping(target = "categoryId", expression = "java(e.getCategory() != null ? e.getCategory().getId() : null)"),
            @Mapping(target = "proficiencyName", expression = "java(map(e.getProficiencyName()))")
    })
    SkillResponseDto toDto(SkillEntity e);

    List<SkillResponseDto> toSkillDtoList(List<SkillEntity> list);

    // Nested: categories (with skills)
    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "isPredefined", source = "predefined")
    SkillCategoryResponseDto toDto(SkillCategoryEntity e);

    List<SkillCategoryResponseDto> toCategoryDtoList(List<SkillCategoryEntity> list);

    // Experiences with computed duration and enum->string conversion
    @Mappings({
            @Mapping(target = "employmentType", expression = "java(map(e.getEmploymentType()))"),
            @Mapping(target = "seniorityLevel", expression = "java(map(e.getSeniorityLevel()))"),
            @Mapping(target = "durationMonths", expression = "java(computeDurationInMonths(e.getStartDate(), e.getEndDate(), e.isCurrentlyWorking()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeDuration(e.getStartDate(), e.getEndDate(), e.isCurrentlyWorking()))")
    })
    ExperienceResponseDto toDto(ExperienceEntity e);

    List<ExperienceResponseDto> toExperienceDtoList(List<ExperienceEntity> list);

    // Educations
    EducationResponseDto toDto(EducationEntity e);

    java.util.List<EducationResponseDto> toEducationDtoList(java.util.List<EducationEntity> list);

    // Projects with computed durations
    @Mappings({
            @Mapping(target = "projectType", expression = "java(map(e.getProjectType()))"),
            @Mapping(target = "role", expression = "java(map(e.getRole()))"),
            @Mapping(target = "durationMonths", expression = "java(computeDurationInMonths(e.getStartDate(), e.getEndDate(), e.isCurrentlyActive()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeDuration(e.getStartDate(), e.getEndDate(), e.isCurrentlyActive()))")
    })
    ProjectResponseDto toDto(ProjectEntity e);

    java.util.List<ProjectResponseDto> toProjectDtoList(java.util.List<ProjectEntity> list);

    // Awards
    AwardResponseDto toDto(AwardEntity e);

    java.util.List<AwardResponseDto> toAwardDtoList(java.util.List<AwardEntity> list);

    // Publications
    PublicationResponseDto toDto(PublicationEntity e);

    java.util.List<PublicationResponseDto> toPublicationDtoList(java.util.List<PublicationEntity> list);

    // Patents
    PatentResponseDto toDto(PatentEntity e);

    java.util.List<PatentResponseDto> toPatentDtoList(java.util.List<PatentEntity> list);

    // Credentials
    CredentialResponseDto toDto(CredentialEntity e);

    java.util.List<CredentialResponseDto> toCredentialDtoList(java.util.List<CredentialEntity> list);

    // Courses with computed duration and enum->string conversion
    @Mappings({
            @Mapping(target = "level", expression = "java(map(e.getLevel()))"),
            @Mapping(target = "deliveryMode", expression = "java(map(e.getDeliveryMode()))"),
            @Mapping(target = "status", expression = "java(map(e.getStatus()))"),
            @Mapping(target = "durationMonths", expression = "java(computeCourseDurationInMonths(e.getStartDate(), e.getEndDate(), e.getCompletionDate(), e.getStatus()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeCourseDuration(e.getStartDate(), e.getEndDate(), e.getCompletionDate(), e.getStatus()))")
    })
    CourseResponseDto toDto(CourseEntity e);

    java.util.List<CourseResponseDto> toCourseDtoList(java.util.List<CourseEntity> list);

    // Talks
    @Mappings({
            @Mapping(target = "type", expression = "java(map(e.getType()))"),
            @Mapping(target = "role", expression = "java(map(e.getRole()))"),
            @Mapping(target = "status", expression = "java(map(e.getStatus()))"),
            @Mapping(target = "durationDays", expression = "java(computeTalkDurationInDays(e.getStartDate(), e.getEndDate()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeTalkDuration(e.getStartDate(), e.getEndDate()))"),
            @Mapping(target = "locationDisplay", expression = "java(buildTalkLocation(e))")
    })
    TalkResponseDto toDto(TalkEntity e);

    java.util.List<TalkResponseDto> toTalkDtoList(java.util.List<TalkEntity> list);

    // Volunteerings
    @Mappings({
            @Mapping(target = "type", expression = "java(map(e.getType()))"),
            @Mapping(target = "status", expression = "java(map(e.getStatus()))"),
            @Mapping(target = "engagementMode", expression = "java(map(e.getEngagementMode()))"),
            @Mapping(target = "cause", expression = "java(map(e.getCause()))"),
            @Mapping(target = "durationMonths", expression = "java(computeVolunteerDurationInMonths(e.getStartDate(), e.getEndDate(), e.getStatus()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeVolunteerDuration(e.getStartDate(), e.getEndDate(), e.getStatus()))"),
            @Mapping(target = "locationDisplay", expression = "java(buildVolunteerLocation(e))")
    })
    VolunteeringResponseDto toDto(VolunteeringEntity e);

    java.util.List<VolunteeringResponseDto> toVolunteerDtoList(java.util.List<VolunteeringEntity> list);

    // References
    com.resumebuilder.ai_resume_api.dto.resume.ReferenceResponseDto toDto(
            ReferenceEntity e);

    java.util.List<com.resumebuilder.ai_resume_api.dto.resume.ReferenceResponseDto> toReferenceDtoList(
            java.util.List<ReferenceEntity> list);

    // Summaries
    default ResumeSummaryDto toSummary(ResumeEntity r) {
        return new ResumeSummaryDto(
                r.getId(),
                r.getTitle(),
                r.getUpdatedAt(),
                r.getResumeType().name(),
                r.getBaseResume() != null ? r.getBaseResume().getId() : null);
    }

    default List<ResumeSummaryDto> toSummaryList(List<ResumeEntity> list) {
        return list == null ? java.util.List.of() : list.stream().map(this::toSummary).toList();
    }

    // <-------------------------------------------------------------------- Enum ->
    // String conversions for responses
    // ---------------------------------------------------------------

    default String map(SkillProficiencyType t) {
        return t == null ? null : t.name();
    }

    default String map(LanguageProficiency p) {
        return p == null ? null : p.name();
    }

    default String map(EmploymentType t) {
        return t == null ? null : t.name();
    }

    default String map(SeniorityLevel s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.SkillLevel lvl) {
        return lvl == null ? null : lvl.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.ProjectType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.ProjectRole r) {
        return r == null ? null : r.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.ProjectLinkType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.AwardType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.PublicationType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.PublicationStatus s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.PresentationType p) {
        return p == null ? null : p.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.PatentStatus s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.PatentOffice o) {
        return o == null ? null : o.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.PatentLinkType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.CredentialType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.CredentialStatus s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.CourseLevel l) {
        return l == null ? null : l.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.CourseDeliveryMode m) {
        return m == null ? null : m.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.CourseStatus s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.CourseLinkType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.TalkType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.TalkRole r) {
        return r == null ? null : r.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.TalkStatus s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.TalkLinkType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.VolunteerType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.VolunteerStatus s) {
        return s == null ? null : s.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.VolunteerEngagementMode m) {
        return m == null ? null : m.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.VolunteerCause c) {
        return c == null ? null : c.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.VolunteerLinkType t) {
        return t == null ? null : t.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.ReferenceRelationship r) {
        return r == null ? null : r.name();
    }

    default String map(com.resumebuilder.ai_resume_api.enums.ReferenceContactMethod m) {
        return m == null ? null : m.name();
    }

    // <---------------------------------------------------- DTO <-> Embeddable
    // conversions for nested collections
    // -------------------------------------------------------------------

    // Experience links (embeddable <-> dto)
    ExperienceLinkDto toDto(ExperienceLink link);

    List<ExperienceLinkDto> toExpLinkDtoList(List<ExperienceLink> list);

    // Education project links (embeddable <-> dto)
    EducationProjectLinkDto toDto(com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink link);

    java.util.List<EducationProjectLinkDto> toEduLinkDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink> list);

    // Project links and media (embeddable <-> dto)
    ProjectLinkDto toDto(com.resumebuilder.ai_resume_api.entity.embedded.ProjectLink link);

    java.util.List<ProjectLinkDto> toProjectLinkDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.ProjectLink> list);

    ProjectMediaDto toDto(com.resumebuilder.ai_resume_api.entity.embedded.ProjectMedia media);

    java.util.List<ProjectMediaDto> toProjectMediaDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.ProjectMedia> list);

    // Patent links (embeddable <-> dto)
    PatentLinkDto toDto(
            com.resumebuilder.ai_resume_api.entity.embedded.PatentLink link);

    java.util.List<PatentLinkDto> toPatentLinkDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.PatentLink> list);

    // Course links (embeddable <-> dto)
    CourseLinkDto toDto(com.resumebuilder.ai_resume_api.entity.embedded.CourseLink link);

    java.util.List<CourseLinkDto> toCourseLinkDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.CourseLink> list);

    // Talk links (embeddable <-> dto)
    TalkLinkDto toDto(com.resumebuilder.ai_resume_api.entity.embedded.TalkLink link);

    java.util.List<TalkLinkDto> toTalkLinkDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.TalkLink> list);

    // Volunteer links (embeddable <-> dto)
    VolunteerLinkDto toDto(com.resumebuilder.ai_resume_api.entity.embedded.VolunteerLink link);

    java.util.List<VolunteerLinkDto> toVolunteerLinkDtoList(
            java.util.List<com.resumebuilder.ai_resume_api.entity.embedded.VolunteerLink> list);

    // <----------------------------------------------------------------------------------Helpers------------------------------------------------------------------------------------------>

    // --- Duration helpers for ExperienceResponseDto ---
    default Integer computeDurationInMonths(LocalDate start, LocalDate end, boolean currentlyWorking) {
        if (start == null)
            return null;
        LocalDate effectiveEnd = (end != null && !currentlyWorking) ? end : LocalDate.now();
        if (effectiveEnd.isBefore(start))
            return 0;
        Period p = Period.between(start, effectiveEnd);
        return p.getYears() * 12 + p.getMonths();
    }

    default String humanizeDuration(LocalDate start, LocalDate end, boolean currentlyWorking) {
        Integer months = computeDurationInMonths(start, end, currentlyWorking);
        if (months == null)
            return null;
        int yrs = months / 12;
        int mos = months % 12;
        StringBuilder sb = new StringBuilder();
        if (yrs > 0)
            sb.append(yrs).append(yrs == 1 ? " yr" : " yrs");
        if (mos > 0) {
            if (sb.length() > 0)
                sb.append(" ");
            sb.append(mos).append(mos == 1 ? " mo" : " mos");
        }
        if (sb.length() == 0)
            return "0 mos";
        return sb.toString();
    }

    // ---- Duration helpers for CourseResponseDto ----
    default Integer computeCourseDurationInMonths(
            java.time.LocalDate start,
            java.time.LocalDate end,
            java.time.LocalDate completion,
            com.resumebuilder.ai_resume_api.enums.CourseStatus status) {

        if (start == null)
            return null;

        java.time.LocalDate effectiveEnd = calcCourseEffectiveEnd(start, end, completion, status);
        if (effectiveEnd.isBefore(start))
            return 0;

        java.time.Period p = java.time.Period.between(start, effectiveEnd);
        return p.getYears() * 12 + p.getMonths();
    }

    default String humanizeCourseDuration(
            java.time.LocalDate start,
            java.time.LocalDate end,
            java.time.LocalDate completion,
            com.resumebuilder.ai_resume_api.enums.CourseStatus status) {

        Integer months = computeCourseDurationInMonths(start, end, completion, status);
        if (months == null)
            return null;
        int yrs = months / 12;
        int mos = months % 12;

        StringBuilder sb = new StringBuilder();
        if (yrs > 0)
            sb.append(yrs).append(yrs == 1 ? " yr" : " yrs");
        if (mos > 0) {
            if (sb.length() > 0)
                sb.append(" ");
            sb.append(mos).append(mos == 1 ? " mo" : " mos");
        }
        if (sb.length() == 0)
            return "0 mos";
        return sb.toString();
    }

    // Decide which end date to use for duration
    default java.time.LocalDate calcCourseEffectiveEnd(
            java.time.LocalDate start,
            java.time.LocalDate end,
            java.time.LocalDate completion,
            com.resumebuilder.ai_resume_api.enums.CourseStatus status) {

        if (completion != null)
            return completion;
        if (status == com.resumebuilder.ai_resume_api.enums.CourseStatus.IN_PROGRESS)
            return java.time.LocalDate.now();
        if (end != null) {
            // If end is in future but status not IN_PROGRESS, still use end
            return end.isBefore(start) ? start : end;
        }
        // Fallbacks:
        if (status == com.resumebuilder.ai_resume_api.enums.CourseStatus.PLANNED)
            return start;
        return java.time.LocalDate.now();
    }

    // ---- Duration helpers for TalkResponseDto ----
    default Integer computeTalkDurationInDays(LocalDate start, LocalDate end) {
        if (start == null)
            return null;
        LocalDate effectiveEnd = (end != null) ? end : start;
        if (effectiveEnd.isBefore(start))
            return 0;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(start, effectiveEnd) + 1;
    }

    default String humanizeTalkDuration(LocalDate start, LocalDate end) {
        Integer days = computeTalkDurationInDays(start, end);
        if (days == null)
            return null;
        if (days == 1)
            return "1 day";
        if (days < 7)
            return days + " days";
        int weeks = days / 7;
        int remDays = days % 7;
        StringBuilder sb = new StringBuilder();
        if (weeks > 0)
            sb.append(weeks).append(weeks == 1 ? " wk" : " wks");
        if (remDays > 0)
            sb.append(" ").append(remDays).append(remDays == 1 ? " day" : " days");
        return sb.toString().trim();
    }

    default String buildTalkLocation(TalkEntity e) {
        if (e.isVirtual())
            return "Virtual";
        StringBuilder sb = new StringBuilder();
        if (e.getVenue() != null && !e.getVenue().isBlank())
            sb.append(e.getVenue());
        if (e.getCity() != null && !e.getCity().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getCity());
        }
        if (e.getRegion() != null && !e.getRegion().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getRegion());
        }
        if (e.getCountry() != null && !e.getCountry().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getCountry());
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    // ---- Duration helpers for VolunteeringResponseDto ----
    default Integer computeVolunteerDurationInMonths(
            LocalDate start, LocalDate end, com.resumebuilder.ai_resume_api.enums.VolunteerStatus status) {
        if (start == null)
            return null;
        LocalDate effectiveEnd = calcVolunteerEffectiveEnd(start, end, status);
        if (effectiveEnd.isBefore(start))
            return 0;
        java.time.Period p = java.time.Period.between(start, effectiveEnd);
        return p.getYears() * 12 + p.getMonths();
    }

    default String humanizeVolunteerDuration(
            LocalDate start, LocalDate end, com.resumebuilder.ai_resume_api.enums.VolunteerStatus status) {
        Integer months = computeVolunteerDurationInMonths(start, end, status);
        if (months == null)
            return null;
        int yrs = months / 12, mos = months % 12;
        StringBuilder sb = new StringBuilder();
        if (yrs > 0)
            sb.append(yrs).append(yrs == 1 ? " yr" : " yrs");
        if (mos > 0) {
            if (sb.length() > 0)
                sb.append(" ");
            sb.append(mos).append(mos == 1 ? " mo" : " mos");
        }
        return sb.length() == 0 ? "0 mos" : sb.toString();
    }

    default LocalDate calcVolunteerEffectiveEnd(
            LocalDate start, LocalDate end, com.resumebuilder.ai_resume_api.enums.VolunteerStatus status) {
        if (end != null)
            return end;
        if (status == com.resumebuilder.ai_resume_api.enums.VolunteerStatus.ONGOING)
            return LocalDate.now();
        if (status == com.resumebuilder.ai_resume_api.enums.VolunteerStatus.PLANNED)
            return start;
        if (status == com.resumebuilder.ai_resume_api.enums.VolunteerStatus.COMPLETED)
            return start;
        // PAUSED or unknown -> use now to represent time invested so far
        return LocalDate.now();
    }

    default String buildVolunteerLocation(VolunteeringEntity e) {
        StringBuilder sb = new StringBuilder();
        if (e.getCity() != null && !e.getCity().isBlank())
            sb.append(e.getCity());
        if (e.getRegion() != null && !e.getRegion().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getRegion());
        }
        if (e.getCountry() != null && !e.getCountry().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getCountry());
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    // ============================================================================
    // PROFILE ENTITY MAPPINGS (PersonalInfo sections)
    // ============================================================================

    // Profile Experiences
    @Mappings({
            @Mapping(target = "employmentType", expression = "java(map(e.getEmploymentType()))"),
            @Mapping(target = "seniorityLevel", expression = "java(map(e.getSeniorityLevel()))"),
            @Mapping(target = "durationMonths", expression = "java(computeDurationInMonths(e.getStartDate(), e.getEndDate(), e.isCurrentlyWorking()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeDuration(e.getStartDate(), e.getEndDate(), e.isCurrentlyWorking()))")
    })
    ExperienceResponseDto toDto(PersonalInfoExperienceEntity e);

    List<ExperienceResponseDto> toProfileExperienceDtoList(
            List<PersonalInfoExperienceEntity> list);

    // Profile Education
    EducationResponseDto toDto(PersonalInfoEducationEntity e);

    List<EducationResponseDto> toProfileEducationDtoList(
            List<PersonalInfoEducationEntity> list);

    // Profile Skill Categories
    @Mapping(target = "skills", source = "skills")
    @Mapping(target = "isPredefined", source = "predefined")
    SkillCategoryResponseDto toDto(PersonalInfoSkillCategoryEntity e);

    List<SkillCategoryResponseDto> toProfileCategoryDtoList(
            List<PersonalInfoSkillCategoryEntity> list);

    // Profile Skills
    @Mappings({
            @Mapping(target = "categoryId", expression = "java(e.getCategory() != null ? e.getCategory().getId() : null)"),
            @Mapping(target = "proficiencyName", expression = "java(map(e.getProficiencyName()))")
    })
    SkillResponseDto toDto(PersonalInfoSkillEntity e);

    List<SkillResponseDto> toProfileSkillDtoList(
            List<PersonalInfoSkillEntity> list);

    // Profile Certifications (nested in skills)
    CertificationResponseDto toDto(PersonalInfoCertificationEntity e);

    List<CertificationResponseDto> toProfileCertDtoList(
            List<PersonalInfoCertificationEntity> list);

    // Profile Projects
    @Mappings({
            @Mapping(target = "projectType", expression = "java(map(e.getProjectType()))"),
            @Mapping(target = "role", expression = "java(map(e.getRole()))"),
            @Mapping(target = "durationMonths", expression = "java(computeDurationInMonths(e.getStartDate(), e.getEndDate(), e.isCurrentlyActive()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeDuration(e.getStartDate(), e.getEndDate(), e.isCurrentlyActive()))")
    })
    ProjectResponseDto toDto(PersonalInfoProjectEntity e);

    List<ProjectResponseDto> toProfileProjectDtoList(
            List<PersonalInfoProjectEntity> list);

    // Profile Awards
    AwardResponseDto toDto(PersonalInfoAwardEntity e);

    List<AwardResponseDto> toProfileAwardDtoList(
            List<PersonalInfoAwardEntity> list);

    // Profile Publications
    PublicationResponseDto toDto(PersonalInfoPublicationEntity e);

    List<PublicationResponseDto> toProfilePublicationDtoList(
            List<PersonalInfoPublicationEntity> list);

    // Profile Patents
    PatentResponseDto toDto(PersonalInfoPatentEntity e);

    List<PatentResponseDto> toProfilePatentDtoList(
            List<PersonalInfoPatentEntity> list);

    // Profile Credentials
    CredentialResponseDto toDto(PersonalInfoCredentialEntity e);

    List<CredentialResponseDto> toProfileCredentialDtoList(
            List<PersonalInfoCredentialEntity> list);

    // Profile Courses
    @Mappings({
            @Mapping(target = "level", expression = "java(map(e.getLevel()))"),
            @Mapping(target = "deliveryMode", expression = "java(map(e.getDeliveryMode()))"),
            @Mapping(target = "status", expression = "java(map(e.getStatus()))"),
            @Mapping(target = "durationMonths", expression = "java(computeCourseDurationInMonths(e.getStartDate(), e.getEndDate(), e.getCompletionDate(), e.getStatus()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeCourseDuration(e.getStartDate(), e.getEndDate(), e.getCompletionDate(), e.getStatus()))")
    })
    CourseResponseDto toDto(PersonalInfoCourseEntity e);

    List<CourseResponseDto> toProfileCourseDtoList(
            List<PersonalInfoCourseEntity> list);

    // Profile Talks
    @Mappings({
            @Mapping(target = "type", expression = "java(map(e.getType()))"),
            @Mapping(target = "role", expression = "java(map(e.getRole()))"),
            @Mapping(target = "status", expression = "java(map(e.getStatus()))"),
            @Mapping(target = "durationDays", expression = "java(computeTalkDurationInDays(e.getStartDate(), e.getEndDate()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeTalkDuration(e.getStartDate(), e.getEndDate()))"),
            @Mapping(target = "locationDisplay", expression = "java(buildTalkLocation(e))")
    })
    TalkResponseDto toDto(PersonalInfoTalkEntity e);

    List<TalkResponseDto> toProfileTalkDtoList(
            List<PersonalInfoTalkEntity> list);

    // Profile Volunteering
    @Mappings({
            @Mapping(target = "type", expression = "java(map(e.getType()))"),
            @Mapping(target = "status", expression = "java(map(e.getStatus()))"),
            @Mapping(target = "engagementMode", expression = "java(map(e.getEngagementMode()))"),
            @Mapping(target = "cause", expression = "java(map(e.getCause()))"),
            @Mapping(target = "durationMonths", expression = "java(computeVolunteerDurationInMonths(e.getStartDate(), e.getEndDate(), e.getStatus()))"),
            @Mapping(target = "durationHumanized", expression = "java(humanizeVolunteerDuration(e.getStartDate(), e.getEndDate(), e.getStatus()))"),
            @Mapping(target = "locationDisplay", expression = "java(buildVolunteerLocation(e))")
    })
    VolunteeringResponseDto toDto(PersonalInfoVolunteeringEntity e);

    List<VolunteeringResponseDto> toProfileVolunteerDtoList(
            List<PersonalInfoVolunteeringEntity> list);

    // Profile References
    ReferenceResponseDto toDto(PersonalInfoReferenceEntity e);

    List<ReferenceResponseDto> toProfileReferenceDtoList(
            List<PersonalInfoReferenceEntity> list);

    // ============================================================================
    // PROFILE HELPER METHODS (reuse existing helper methods from resume mappings)
    // ============================================================================

    // Talk location builder for profile talks
    default String buildTalkLocation(PersonalInfoTalkEntity e) {
        if (e.isVirtual())
            return "Virtual";
        StringBuilder sb = new StringBuilder();
        if (e.getVenue() != null && !e.getVenue().isBlank())
            sb.append(e.getVenue());
        if (e.getCity() != null && !e.getCity().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getCity());
        }
        if (e.getRegion() != null && !e.getRegion().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getRegion());
        }
        if (e.getCountry() != null && !e.getCountry().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getCountry());
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    // Volunteer location builder for profile volunteering
    default String buildVolunteerLocation(PersonalInfoVolunteeringEntity e) {
        StringBuilder sb = new StringBuilder();
        if (e.getCity() != null && !e.getCity().isBlank())
            sb.append(e.getCity());
        if (e.getRegion() != null && !e.getRegion().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getRegion());
        }
        if (e.getCountry() != null && !e.getCountry().isBlank()) {
            if (sb.length() > 0)
                sb.append(", ");
            sb.append(e.getCountry());
        }
        return sb.length() == 0 ? null : sb.toString();
    }
}