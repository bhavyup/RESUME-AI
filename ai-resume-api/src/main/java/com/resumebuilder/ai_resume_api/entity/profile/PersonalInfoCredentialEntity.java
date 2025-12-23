package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.enums.CredentialStatus;
import com.resumebuilder.ai_resume_api.enums.CredentialType;
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
@Table(name = "personal_info_credentials", indexes = {
        @Index(name = "idx_pi_cred_personal_info", columnList = "personal_info_id"),
        @Index(name = "idx_pi_cred_issue_date", columnList = "issue_date")
})
public class PersonalInfoCredentialEntity {

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

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 16)
    private CredentialType type;

    @Column(name = "issuer", length = 255, nullable = false)
    private String issuer;

    @Column(name = "issuer_url", length = 1024)
    private String issuerUrl;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "does_not_expire", nullable = false)
    private boolean doesNotExpire;

    @Column(name = "credential_id", length = 128)
    private String credentialId;

    @Column(name = "credential_url", length = 2048)
    private String credentialUrl;

    @Column(name = "score", precision = 10, scale = 2)
    private BigDecimal score;

    @Column(name = "score_unit", length = 32)
    private String scoreUnit;

    @Column(name = "level", length = 128)
    private String level;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16)
    private CredentialStatus status;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "badge_image_url", length = 2048)
    private String badgeImageUrl;

    @ElementCollection
    @CollectionTable(name = "personal_info_credential_keywords", joinColumns = @JoinColumn(name = "credential_id"))
    @OrderColumn(name = "tag_order")
    @Column(name = "keyword", length = 64, nullable = false)
    private List<String> keywords = new ArrayList<>();

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