package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.embedded.CourseLink;
import com.resumebuilder.ai_resume_api.enums.CourseDeliveryMode;
import com.resumebuilder.ai_resume_api.enums.CourseLevel;
import com.resumebuilder.ai_resume_api.enums.CourseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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
@Table(name = "resume_courses", indexes = {
        @Index(name = "idx_rcourse_resume_order", columnList = "resume_id, display_order")
})
public class CourseEntity {

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

    @Column(length = 255, nullable = false)
    private String provider;

    @Column(length = 128)
    private String platform;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate completionDate;

    @Column(precision = 6, scale = 2)
    private BigDecimal hours;

    @Column(length = 128)
    private String credentialId;

    @Column(length = 2048)
    private String credentialUrl;

    @Column(length = 2048)
    private String certificateUrl;

    @Column(length = 64)
    private String grade;

    @Column(precision = 10, scale = 2)
    private BigDecimal score;

    @Column(length = 32)
    private String scoreUnit;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private CourseLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_mode", length = 16)
    private CourseDeliveryMode deliveryMode;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private CourseStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Ordered lists
    @ElementCollection
    @CollectionTable(name = "resume_course_instructors", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "name_order")
    @Column(name = "full_name", length = 128, nullable = false)
    private List<String> instructors = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "resume_course_topics", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", length = 255, nullable = false)
    private List<String> topics = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "resume_course_links", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "display_order")
    private List<CourseLink> links = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}