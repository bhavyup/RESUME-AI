package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.embedded.ExperienceLink;
import com.resumebuilder.ai_resume_api.enums.EmploymentType;
import com.resumebuilder.ai_resume_api.enums.SeniorityLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "resume" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "experiences", indexes = {
        @Index(name = "idx_exp_resume", columnList = "resume_id"),
        @Index(name = "idx_exp_start_date", columnList = "start_date"),
        @Index(name = "idx_exp_company", columnList = "company_name"),
        @Index(name = "idx_exp_employment_type", columnList = "employment_type")
})
public class ExperienceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 255)
    private String jobTitle;

    @Column(length = 255)
    private String companyName;

    @Column(length = 255)
    private String companyWebsite;

    // legacy free-form if present
    @Column(length = 255)
    private String location;

    @Column(name = "location_city", length = 128)
    private String locationCity;

    @Column(name = "location_state", length = 128)
    private String locationState;

    @Column(name = "location_country", length = 128)
    private String locationCountry;

    @Column(name = "remote", nullable = false)
    private boolean remote;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 32)
    private EmploymentType employmentType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "currently_working", nullable = false)
    private boolean currentlyWorking;

    // Narrative description (kept)
    @Column(columnDefinition = "TEXT")
    private String description;

    // Responsibilities (bulleted)
    @ElementCollection
    @CollectionTable(name = "experience_responsibilities", joinColumns = @JoinColumn(name = "experience_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", columnDefinition = "TEXT", nullable = false)
    private List<String> responsibilities = new ArrayList<>();

    // Achievements / impact (bulleted)
    @ElementCollection
    @CollectionTable(name = "experience_achievements", joinColumns = @JoinColumn(name = "experience_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", columnDefinition = "TEXT", nullable = false)
    private List<String> achievements = new ArrayList<>();

    // Technologies used / tech stack
    @ElementCollection
    @CollectionTable(name = "experience_technologies", joinColumns = @JoinColumn(name = "experience_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "tag", length = 128, nullable = false)
    private List<String> technologies = new ArrayList<>();

    // Methods / frameworks / tools
    @ElementCollection
    @CollectionTable(name = "experience_methods", joinColumns = @JoinColumn(name = "experience_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "tag", length = 128, nullable = false)
    private List<String> methods = new ArrayList<>();

    // Links to projects / demos
    @ElementCollection
    @CollectionTable(name = "experience_links", joinColumns = @JoinColumn(name = "experience_id"))
    @OrderColumn(name = "display_order")
    private List<ExperienceLink> links = new ArrayList<>();

    // Manager info
    @Column(name = "manager_name", length = 128)
    private String managerName;

    @Column(name = "manager_contact", length = 255)
    private String managerContact;

    @Column(name = "team_size")
    private Integer teamSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "seniority_level", length = 32)
    private SeniorityLevel seniorityLevel;

    @Column(name = "reports_to_title", length = 128)
    private String reportsToTitle;

    @Column(name = "confidential", nullable = false)
    private boolean confidential;

    // STAR fields (for internal prompts or structured summaries)
    @Column(name = "star_situation", columnDefinition = "TEXT")
    private String starSituation;
    @Column(name = "star_task", columnDefinition = "TEXT")
    private String starTask;
    @Column(name = "star_action", columnDefinition = "TEXT")
    private String starAction;
    @Column(name = "star_result", columnDefinition = "TEXT")
    private String starResult;

    // KPIs
    @Column(name = "kpi_revenue_impact_usd", precision = 19, scale = 2)
    private java.math.BigDecimal kpiRevenueImpactUsd;

    @Column(name = "kpi_percent_improvement", precision = 5, scale = 2)
    private java.math.BigDecimal kpiPercentImprovement;

    @Column(name = "kpi_time_saved_hours")
    private Integer kpiTimeSavedHours;

    @Column(name = "kpi_users")
    private Integer kpiUsers;

    @Column(name = "kpi_arr_usd", precision = 19, scale = 2)
    private java.math.BigDecimal kpiArrUsd;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}