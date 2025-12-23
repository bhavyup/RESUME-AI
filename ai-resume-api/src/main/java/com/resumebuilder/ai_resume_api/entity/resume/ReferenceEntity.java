package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.enums.ReferenceContactMethod;
import com.resumebuilder.ai_resume_api.enums.ReferenceRelationship;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "resume")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "resume_references", indexes = {
        @Index(name = "idx_rref_resume_order", columnList = "resume_id, display_order")
})
public class ReferenceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Version
    private Long version;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "company", length = 255)
    private String company;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship", length = 16)
    private ReferenceRelationship relationship;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_method", length = 16)
    private ReferenceContactMethod preferredContactMethod;

    @Column(name = "email", length = 320)
    private String email;

    @Column(name = "phone", length = 64)
    private String phone;

    @Column(name = "linkedin_url", length = 2048)
    private String linkedinUrl;

    @Column(name = "website_url", length = 2048)
    private String websiteUrl;

    @Column(name = "consent_to_share", nullable = false)
    private boolean consentToShare;

    @Column(name = "visible", nullable = false)
    private boolean visible;

    @Column(name = "relationship_note", length = 255)
    private String relationshipNote;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "last_verified_on")
    private LocalDate lastVerifiedOn;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}