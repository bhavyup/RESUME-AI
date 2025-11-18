package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "resume" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "resume_languages", uniqueConstraints = {
        @UniqueConstraint(name = "uk_resume_language_name", columnNames = { "resume_id", "language_name" })
}, indexes = {
        @Index(name = "idx_rl_resume", columnList = "resume_id")
})
public class ResumeLanguageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "language_name", nullable = false, length = 64)
    private String languageName;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency", nullable = false, length = 64)
    private com.resumebuilder.ai_resume_api.enums.LanguageProficiency proficiency;

    @Version
    private Long version;

    @jakarta.persistence.Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}