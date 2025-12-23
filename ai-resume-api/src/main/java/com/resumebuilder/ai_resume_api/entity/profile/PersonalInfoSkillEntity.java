package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "personalInfo", "category", "certifications" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "personal_info_skills", indexes = {
        @Index(name = "idx_pi_skill_personal_info", columnList = "personal_info_id"),
        @Index(name = "idx_pi_skill_category", columnList = "category_id")
})
public class PersonalInfoSkillEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 128, nullable = false)
    private String name;

    @Column(length = 32, nullable = false)
    private int proficiencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_name", length = 32)
    private com.resumebuilder.ai_resume_api.enums.SkillLevel proficiencyName;

    private Integer yearsOfExperience;

    @Column(name = "last_used")
    private java.time.LocalDate lastUsed;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private java.time.Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "personal_info_id", nullable = false)
    @JsonIgnore
    private PersonalInfoEntity personalInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private PersonalInfoSkillCategoryEntity category;

    @ElementCollection
    @CollectionTable(name = "personal_info_skill_keywords", joinColumns = @JoinColumn(name = "skill_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private List<String> keywords = new ArrayList<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<PersonalInfoCertificationEntity> certifications = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.Instant.now();
        updatedAt = java.time.Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.Instant.now();
    }
}