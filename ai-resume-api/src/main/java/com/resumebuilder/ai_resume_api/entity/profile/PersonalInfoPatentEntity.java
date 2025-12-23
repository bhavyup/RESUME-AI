package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.entity.embedded.PatentLink;
import com.resumebuilder.ai_resume_api.enums.PatentOffice;
import com.resumebuilder.ai_resume_api.enums.PatentStatus;
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
@Table(name = "personal_info_patents", indexes = {
        @Index(name = "idx_pi_patent_personal_info", columnList = "personal_info_id"),
        @Index(name = "idx_pi_patent_status_date", columnList = "status, grant_date")
})
public class PersonalInfoPatentEntity {

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

    @Column(name = "patent_number", length = 128)
    private String patentNumber;

    @Column(name = "application_number", length = 128)
    private String applicationNumber;

    @Column(name = "priority_number", length = 128)
    private String priorityNumber;

    @Column(name = "pct_number", length = 64)
    private String pctNumber;

    private LocalDate filingDate;
    private LocalDate grantDate;
    private LocalDate publicationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16)
    private PatentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "office", length = 16)
    private PatentOffice office;

    @Column(name = "jurisdiction_country", length = 3)
    private String jurisdictionCountry;

    @Column(name = "kind_code", length = 16)
    private String kindCode;

    @Column(name = "family_id", length = 64)
    private String familyId;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "claims_summary", columnDefinition = "TEXT")
    private String claimsSummary;

    @Column(name = "official_url", length = 2048)
    private String officialUrl;

    @ElementCollection
    @CollectionTable(name = "personal_info_patent_inventors", joinColumns = @JoinColumn(name = "patent_id"))
    @OrderColumn(name = "name_order")
    @Column(name = "full_name", length = 128, nullable = false)
    private List<String> inventors = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_patent_assignees", joinColumns = @JoinColumn(name = "patent_id"))
    @OrderColumn(name = "name_order")
    @Column(name = "organization", length = 255, nullable = false)
    private List<String> assignees = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_patent_ipc_classes", joinColumns = @JoinColumn(name = "patent_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "code", length = 32, nullable = false)
    private List<String> ipcClasses = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_patent_cpc_classes", joinColumns = @JoinColumn(name = "patent_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "code", length = 32, nullable = false)
    private List<String> cpcClasses = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "personal_info_patent_links", joinColumns = @JoinColumn(name = "patent_id"))
    @OrderColumn(name = "display_order")
    private List<PatentLink> links = new ArrayList<>();

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