package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.resumebuilder.ai_resume_api.enums.AwardType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "personalInfo")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "personal_info_awards", indexes = {
        @Index(name = "idx_pi_award_personal_info", columnList = "personal_info_id"),
        @Index(name = "idx_pi_award_date", columnList = "date_received")
})
public class PersonalInfoAwardEntity {

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
    private String issuer;

    @Column(name = "issuer_url", length = 1024)
    private String issuerUrl;

    @Column(name = "date_received")
    private LocalDate dateReceived;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "monetary_amount_usd", precision = 19, scale = 2)
    private BigDecimal monetaryAmountUsd;

    @Enumerated(EnumType.STRING)
    @Column(name = "award_type", length = 32)
    private AwardType awardType;

    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    @Column(name = "link_title", length = 255)
    private String linkTitle;

    @Column(name = "link_url", length = 2048)
    private String linkUrl;

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