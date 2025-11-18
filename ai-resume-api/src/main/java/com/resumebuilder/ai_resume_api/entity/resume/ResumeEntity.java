package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.entity.base.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import org.hibernate.annotations.BatchSize;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "user", "links", "languages", "skills", "skillCategories", "experiences", "educations" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Entity
@Table(name = "resumes", indexes = {
        @Index(name = "idx_resume_user", columnList = "user_id"),
        @Index(name = "idx_resume_updated_at", columnList = "updated_at")
})
public class ResumeEntity extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Enumerated(EnumType.STRING)
    @Column(name = "resume_type", nullable = false, length = 16)
    private com.resumebuilder.ai_resume_api.enums.ResumeType resumeType = com.resumebuilder.ai_resume_api.enums.ResumeType.BASE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_resume_id")
    @JsonIgnore
    private ResumeEntity baseResume; // Only set if this is a TAILORED resume

    @Column(columnDefinition = "TEXT")
    private String jobDescription; // Only set if this is a TAILORED resume

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_proficiency_type", nullable = false, length = 16)
    private com.resumebuilder.ai_resume_api.enums.SkillProficiencyType skillProficiencyType = com.resumebuilder.ai_resume_api.enums.SkillProficiencyType.NUMERIC;

    @Size(max = 255)
    private String fullName;
    @Size(max = 255)
    private String resumeHeadline;

    @Column(columnDefinition = "TEXT")
    private String professionalSummary;

    @Size(max = 255)
    private String email;
    @Size(max = 32)
    private String phoneNumber;
    @Size(max = 128)
    private String city;
    @Size(max = 128)
    private String state;
    @Size(max = 128)
    private String country;
    @Size(max = 32)
    private String zip;
    @Size(max = 64)
    private String preferredContactMethod;

    @Size(max = 255)
    private String linkedinUrl;
    @Size(max = 255)
    private String githubUrl;
    @Size(max = 255)
    private String websiteUrl;
    @Size(max = 255)
    private String twitterUrl;
    @Size(max = 255)
    private String instagramUrl;
    @Size(max = 255)
    private String telegramUrl;
    @Size(max = 255)
    private String facebookUrl;
    @Size(max = 255)
    private String whatsappUrl;

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<ResumeCustomLinkEntity> links = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "resume_target_roles", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "target_role", length = 255)
    private List<String> targetRoles = new ArrayList<>();

    @Size(max = 32)
    private String workPreference;
    @Size(max = 1024)
    private String photoUrl;

    @Column(name = "references_on_request", nullable = false)
    private boolean referencesOnRequest;

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ResumeLanguageEntity> languages = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<SkillEntity> skills = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @jakarta.persistence.OrderBy("displayOrder ASC, id ASC")
    private List<SkillCategoryEntity> skillCategories = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, startDate DESC, id ASC")
    private List<ExperienceEntity> experiences = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<EducationEntity> educations = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<ProjectEntity> projects = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<AwardEntity> awards = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<PublicationEntity> publications = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<PatentEntity> patents = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<CredentialEntity> credentials = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<CourseEntity> courses = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<TalkEntity> talks = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<VolunteeringEntity> volunteerings = new ArrayList<>();

    @BatchSize(size = 32)
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, id ASC")
    private List<ReferenceEntity> references = new ArrayList<>();
}