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
@ToString(exclude = { "resume" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "educations", indexes = {
        @Index(name = "idx_edu_resume", columnList = "resume_id")
})
public class EducationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 255)
    private String degree; // e.g., B.Tech, MSc, MBA
    @Column(length = 255)
    private String institution;
    @Column(length = 255)
    private String fieldOfStudy; // major/concentration/program

    @Column(length = 255)
    private String institutionWebsite;

    @Column(length = 128)
    private String locationCity;
    @Column(length = 128)
    private String locationCountry;

    // Stored as free-form "YYYY-MM" / "YYYY" (keeping your existing pattern)
    @Column(length = 64)
    private String startDate;
    @Column(length = 64)
    private String endDate;

    // Graduation (or expected)
    @Column(length = 64)
    private String graduationDate;
    @Column(name = "expected_graduation", nullable = false)
    private boolean expectedGraduation;
    @Column(name = "currently_enrolled", nullable = false)
    private boolean currentlyEnrolled;

    // Courses
    @ElementCollection
    @CollectionTable(name = "education_courses", joinColumns = @JoinColumn(name = "education_id"))
    @Column(name = "course", length = 255)
    private List<String> courses = new ArrayList<>();

    private Double gpa;
    @Column(name = "show_gpa", nullable = false)
    private boolean showGpa = true;

    // Honors / class
    @Column(name = "honors", columnDefinition = "TEXT")
    private String honors;
    @Column(name = "show_honors", nullable = false)
    private boolean showHonors = true;
    @Column(name = "grade_class", length = 64)
    private String gradeClass; // e.g., First Class, Distinction

    @Column(columnDefinition = "TEXT")
    private String description;

    // Awards / scholarships (ordered)
    @ElementCollection
    @CollectionTable(name = "education_awards", joinColumns = @JoinColumn(name = "education_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", columnDefinition = "TEXT", nullable = false)
    private List<String> awards = new ArrayList<>();

    // Projects / dissertations (ordered links)
    @ElementCollection
    @CollectionTable(name = "education_projects", joinColumns = @JoinColumn(name = "education_id"))
    @OrderColumn(name = "display_order")
    private List<com.resumebuilder.ai_resume_api.entity.embedded.EducationProjectLink> projects = new ArrayList<>();

    @Version
    private Long version;

    @jakarta.persistence.Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}