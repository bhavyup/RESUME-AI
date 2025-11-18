package com.resumebuilder.ai_resume_api.entity.resume;

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
@ToString(exclude = "resume")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "resume_talks", indexes = {
        @Index(name = "idx_rt_resume_order", columnList = "resume_id, display_order"),
        @Index(name = "idx_rt_resume_start_date", columnList = "resume_id, start_date")
})
public class TalkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "title", length = 255, nullable = false)
    private String title; // Talk title

    @Column(name = "event_name", length = 255, nullable = false)
    private String eventName; // Event/conference name

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

    // Ordered collections
    @ElementCollection
    @CollectionTable(name = "resume_talk_speakers", joinColumns = @JoinColumn(name = "talk_id"))
    @OrderColumn(name = "name_order")
    @Column(name = "full_name", length = 128, nullable = false)
    private List<String> coSpeakers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "resume_talk_keywords", joinColumns = @JoinColumn(name = "talk_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private List<String> keywords = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "resume_talk_links", joinColumns = @JoinColumn(name = "talk_id"))
    @OrderColumn(name = "display_order")
    private List<TalkLink> links = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}