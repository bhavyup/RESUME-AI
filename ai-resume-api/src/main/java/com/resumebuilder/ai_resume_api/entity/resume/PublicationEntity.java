package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.enums.PublicationStatus;
import com.resumebuilder.ai_resume_api.enums.PublicationType;
import com.resumebuilder.ai_resume_api.enums.PresentationType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "resume")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "publications", indexes = {
        @Index(name = "idx_publications_resume_order", columnList = "resume_id, display_order"),
        @Index(name = "idx_publications_resume_type", columnList = "resume_id, publication_type")
})
public class PublicationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(length = 512, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_type", length = 32)
    private PublicationType publicationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 32)
    private PublicationStatus status;

    @Column(name = "venue", length = 255)
    private String venue;

    @Column(name = "publisher", length = 255)
    private String publisher;

    @Column(name = "date_year_month", length = 16)
    private String dateYearMonth; // "YYYY" or "YYYY-MM"

    @Column(name = "peer_reviewed", nullable = false)
    private boolean peerReviewed;

    // Identifiers
    @Column(length = 255)
    private String doi;
    @Column(name = "arxiv_id", length = 64)
    private String arxivId;
    @Column(name = "ssrn_id", length = 64)
    private String ssrnId;
    @Column(name = "pubmed_id", length = 64)
    private String pubmedId;
    @Column(length = 32)
    private String isbn;
    @Column(length = 2048)
    private String url;

    // Content
    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;
    @Column(name = "summary", length = 512)
    private String summary;

    // Metrics
    @Column(name = "citation_count")
    private Integer citationCount;

    // Presentation
    @Column(name = "presentation_title", length = 255)
    private String presentationTitle;
    @Enumerated(EnumType.STRING)
    @Column(name = "presentation_type", length = 16)
    private PresentationType presentationType;
    @Column(name = "event_name", length = 255)
    private String eventName;
    @Column(name = "event_location_city", length = 128)
    private String eventLocationCity;
    @Column(name = "event_location_country", length = 128)
    private String eventLocationCountry;
    @Column(name = "presentation_date")
    private java.time.LocalDate presentationDate;

    // Optional pagination metadata
    @Column(length = 64)
    private String volume;
    @Column(length = 64)
    private String issue;
    @Column(length = 64)
    private String pages;

    // Authors (ordered)
    @ElementCollection
    @CollectionTable(name = "publication_authors", joinColumns = @JoinColumn(name = "publication_id"))
    @OrderColumn(name = "author_order")
    @Column(name = "full_name", length = 128, nullable = false)
    private List<String> authors = new ArrayList<>();

    // Keywords (ordered)
    @ElementCollection
    @CollectionTable(name = "publication_keywords", joinColumns = @JoinColumn(name = "publication_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private List<String> keywords = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}