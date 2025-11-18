package com.resumebuilder.ai_resume_api.entity.resume;

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
@ToString(exclude = "resume")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "awards", indexes = {
        @Index(name = "idx_awards_resume_order", columnList = "resume_id, display_order"),
        @Index(name = "idx_awards_resume_date", columnList = "resume_id, date_received")
})
public class AwardEntity {

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}