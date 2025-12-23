package com.resumebuilder.ai_resume_api.entity.profile;

import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "personal_info")
public class PersonalInfoEntity {

    @Id
    @Column(name="user_id")
    private Long id;

    @Version
    private Long version; // For optimistic locking

    // == Basic Info ==
    private String fullName;
    private String professionalTitle; // e.g., "Senior Backend Engineer"
    private String resumeHeadline; // Short one-line elevator pitch

    // == Professional Summary ==
    @Column(columnDefinition = "TEXT")
    private String professionalSummary;

    // == Contact Details ==
    private String email;
    private String phoneNumber;
    private String city;
    private String state;
    private String country;
    private String zip; // e.g., "City, State, Country"
    private String preferredContactMethod; // e.g., "Email"

    // == Professional Links ==
    private String linkedinUrl;
    private String githubUrl;
    private String websiteUrl;
    private String twitterUrl;
    private String instagramUrl;
    private String telegramUrl;
    private String facebookUrl;
    private String whatsappUrl;

    @OneToMany(mappedBy = "personalInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("title ASC")
    private List<CustomLinkEntity> links;

    // == Preferences & Status ==
    @ElementCollection
    @CollectionTable(name = "personal_info_target_roles", joinColumns = @JoinColumn(name = "personal_info_id"))
    @Column(name = "target_role")
    private List<String> targetRoles; // e.g., "Backend Developer, API Engineer"
    private String workPreference; // e.g., "Remote", "Hybrid", "Onsite"
    private String photoUrl; // We'll store a link to the photo


    @OneToMany(mappedBy = "personalInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("language ASC")
    private List<LanguageEntity> languages;

    // == The link back to the UserEntity ==
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name="user_id")
    @JsonIgnore
    private UserEntity user;
}