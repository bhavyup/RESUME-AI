package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.embedded.VolunteerLink;
import com.resumebuilder.ai_resume_api.enums.VolunteerCause;
import com.resumebuilder.ai_resume_api.enums.VolunteerEngagementMode;
import com.resumebuilder.ai_resume_api.enums.VolunteerStatus;
import com.resumebuilder.ai_resume_api.enums.VolunteerType;
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
@ToString(exclude = "personalInfo")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "personal_info_volunteering", indexes = {
        @Index(name = "idx_pi_vol_personal_info", columnList = "personal_info_id"),
        @Index(name = "idx_pi_vol_start_date", columnList = "start_date")
})
public class PersonalInfoVolunteeringEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "organization", length = 255, nullable = false)
    private String organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 16)
    private VolunteerType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16)
    private VolunteerStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "engagement_mode", length = 16)
    private VolunteerEngagementMode engagementMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "cause", length = 32)
    private VolunteerCause cause;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "hours", precision = 10, scale = 2)
    private BigDecimal hours;

    @Column(name = "city", length = 128)
    private String city;

    @Column(name = "region", length = 128)
    private String region;

    @Column(name = "country", length = 128)
    private String country;

    @Column(name = "org_website_url", length = 2048)
    private String orgWebsiteUrl;

    @Column(name = "cover_image_url", length = 2048)
    private String coverImageUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_responsibilities", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", length = 255, nullable = false)
    private List<String> responsibilities = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_impacts", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", length = 255, nullable = false)
    private List<String> impacts = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_mentees", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "name_order")
    @Column(name = "full_name", length = 128, nullable = false)
    private List<String> mentees = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_events", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", length = 255, nullable = false)
    private List<String> events = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_teaching_topics", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "line_order")
    @Column(name = "line_text", length = 128, nullable = false)
    private List<String> teachingTopics = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_keywords", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private List<String> keywords = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_reference_urls", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "url_order")
    @Column(name = "url", length = 2048, nullable = false)
    private List<String> referenceUrls = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_volunteer_links", joinColumns = @JoinColumn(name = "volunteering_id"))
    @OrderColumn(name = "display_order")
    private List<VolunteerLink> links = new ArrayList<>();

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