package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.embedded.ProjectLink;
import com.resumebuilder.ai_resume_api.entity.embedded.ProjectMedia;
import com.resumebuilder.ai_resume_api.enums.ProjectRole;
import com.resumebuilder.ai_resume_api.enums.ProjectType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "personalInfo")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "personal_info_projects", indexes = {
        @Index(name = "idx_pi_proj_personal_info", columnList = "personal_info_id")
})
public class PersonalInfoProjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(length = 255, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type", length = 32)
    private ProjectType projectType;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 32)
    private ProjectRole role;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(name = "currently_active", nullable = false)
    private boolean currentlyActive;

    @ElementCollection
    @CollectionTable(name = "personal_info_project_technologies", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "tag", length = 128, nullable = false)
    private List<String> technologies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_project_features", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", columnDefinition = "TEXT", nullable = false)
    private List<String> features = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_project_links", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "display_order")
    private List<ProjectLink> links = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_project_media", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "display_order")
    private List<ProjectMedia> media = new ArrayList<>();

    @Column(name = "outcome_summary", columnDefinition = "TEXT")
    private String outcomeSummary;

    @Column(name = "downloads_count")
    private Long downloadsCount;

    @Column(name = "users_count")
    private Long usersCount;

    @Column(name = "stars_count")
    private Long starsCount;

    @Column(name = "revenue_impact_usd", precision = 19, scale = 2)
    private java.math.BigDecimal revenueImpactUsd;

    @Column(name = "license_spdx", length = 64)
    private String licenseSpdx;

    @Column(name = "license_url", length = 1024)
    private String licenseUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private java.time.Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "personal_info_id", nullable = false)
    @JsonIgnore
    private PersonalInfoEntity personalInfo;

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