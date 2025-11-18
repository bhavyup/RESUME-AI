package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.embedded.TalkLink;
import com.resumebuilder.ai_resume_api.enums.TalkRole;
import com.resumebuilder.ai_resume_api.enums.TalkStatus;
import com.resumebuilder.ai_resume_api.enums.TalkType;
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
@Table(name = "personal_info_talks", indexes = {
        @Index(name = "idx_pi_talk_personal_info", columnList = "personal_info_id"),
        @Index(name = "idx_pi_talk_start_date", columnList = "start_date")
})
public class PersonalInfoTalkEntity {

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

    @Column(name = "event_name", length = 255, nullable = false)
    private String eventName;

    @Column(name = "organizer", length = 255)
    private String organizer;

    @Column(name = "track", length = 255)
    private String track;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 16)
    private TalkType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 16)
    private TalkRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16)
    private TalkStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_virtual", nullable = false)
    private boolean virtual;

    @Column(name = "venue", length = 255)
    private String venue;

    @Column(name = "city", length = 128)
    private String city;

    @Column(name = "region", length = 128)
    private String region;

    @Column(name = "country", length = 128)
    private String country;

    @Column(name = "language", length = 64)
    private String language;

    @Column(name = "audience_size")
    private Integer audienceSize;

    @Column(name = "slides_url", length = 2048)
    private String slidesUrl;

    @Column(name = "video_url", length = 2048)
    private String videoUrl;

    @Column(name = "event_url", length = 2048)
    private String eventUrl;

    @Column(name = "cover_image_url", length = 2048)
    private String coverImageUrl;

    @Column(name = "abstract", columnDefinition = "TEXT")
    private String abstractText;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ElementCollection
    @CollectionTable(name = "personal_info_talk_speakers", joinColumns = @JoinColumn(name = "talk_id"))
    @OrderColumn(name = "name_order")
    @Column(name = "full_name", length = 128, nullable = false)
    private List<String> coSpeakers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_talk_keywords", joinColumns = @JoinColumn(name = "talk_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private List<String> keywords = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_talk_links", joinColumns = @JoinColumn(name = "talk_id"))
    @OrderColumn(name = "display_order")
    private List<TalkLink> links = new ArrayList<>();

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