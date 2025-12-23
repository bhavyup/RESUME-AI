package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "resume", "category", "certifications" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "skills", indexes = {
        @Index(name = "idx_sk_resume", columnList = "resume_id"),
        @Index(name = "idx_sk_category", columnList = "category_id")
})
public class SkillEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 128, nullable = false)
    private String name;

    @Column(length = 32, nullable = false)
    private int proficiencyLevel; // 1-5 (used when resume.skillProficiencyType = NUMERIC)

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_name", length = 32)
    private com.resumebuilder.ai_resume_api.enums.SkillLevel proficiencyName; // used when resume.skillProficiencyType =
                                                                              // STRING

    private Integer yearsOfExperience;

    @Column(name = "last_used")
    private java.time.LocalDate lastUsed;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Version
    private Long version;

    @jakarta.persistence.Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private SkillCategoryEntity category;

    // ATS keywords / aliases for matching
    @ElementCollection
    @CollectionTable(name = "skill_keywords", joinColumns = @JoinColumn(name = "skill_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private java.util.List<String> keywords = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<CertificationEntity> certifications = new ArrayList<>();
}