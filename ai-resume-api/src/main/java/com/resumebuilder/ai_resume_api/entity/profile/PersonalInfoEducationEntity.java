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
@ToString(exclude = { "personalInfo" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "personal_info_education", indexes = {
        @Index(name = "idx_pi_edu_personal_info", columnList = "personal_info_id")
})
public class PersonalInfoEducationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 255)
    private String degree;
    @Column(length = 255)
    private String institution;
    @Column(length = 255)
    private String fieldOfStudy;

    @Column(length = 255)
    private String institutionWebsite;

    @Column(length = 128)
    private String locationCity;
    @Column(length = 128)
    private String locationCountry;

    @Column(length = 64)
    private String startDate;
    @Column(length = 64)
    private String endDate;

    @Column(length = 64)
    private String graduationDate;
    @Column(name = "expected_graduation", nullable = false)
    private boolean expectedGraduation;
    @Column(name = "currently_enrolled", nullable = false)
    private boolean currentlyEnrolled;

    @ElementCollection
    @CollectionTable(name = "personal_info_education_courses", joinColumns = @JoinColumn(name = "education_id"))
    @Column(name = "course", length = 255)
    private List<String> courses = new ArrayList<>();

    private Double gpa;
    @Column(name = "show_gpa", nullable = false)
    private boolean showGpa = true;

    @Column(name = "honors", columnDefinition = "TEXT")
    private String honors;
    @Column(name = "show_honors", nullable = false)
    private boolean showHonors = true;
    @Column(name = "grade_class", length = 64)
    private String gradeClass;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "personal_info_education_awards", joinColumns = @JoinColumn(name = "education_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", columnDefinition = "TEXT", nullable = false)
    private List<String> awards = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_education_projects", joinColumns = @JoinColumn(name = "education_id"))
    @OrderColumn(name = "display_order")
    private List<com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink> projects = new ArrayList<>();

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