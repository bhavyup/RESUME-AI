package com.resumebuilder.ai_resume_api.entity.resume;

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
@ToString(exclude = "resume")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "projects", indexes = {
        @Index(name = "idx_projects_resume_order", columnList = "resume_id, display_order"),
        @Index(name = "idx_projects_resume_typedate", columnList = "resume_id, project_type, start_date")
})
public class ProjectEntity {

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

    // Tags and bullets (ordered)
    @ElementCollection
    @CollectionTable(name = "project_technologies", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "tag", length = 128, nullable = false)
    private List<String> technologies = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_features", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", columnDefinition = "TEXT", nullable = false)
    private List<String> features = new ArrayList<>();

    // Links and media (ordered)
    @ElementCollection
    @CollectionTable(name = "project_links", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "display_order")
    private List<ProjectLink> links = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_media", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "display_order")
    private List<ProjectMedia> media = new ArrayList<>();

    // Outcomes / metrics
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

    // License
    @Column(name = "license_spdx", length = 64)
    private String licenseSpdx;

    @Column(name = "license_url", length = 1024)
    private String licenseUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}