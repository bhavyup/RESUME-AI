package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "skill" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "certifications", indexes = {
        @Index(name = "idx_cert_skill", columnList = "skill_id")
})
public class CertificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 255)
    private String name;

    @Column(length = 2048)
    private String url;

    @Column(name = "document_url", length = 2048)
    private String documentUrl;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    @JsonIgnore
    private SkillEntity skill;
}