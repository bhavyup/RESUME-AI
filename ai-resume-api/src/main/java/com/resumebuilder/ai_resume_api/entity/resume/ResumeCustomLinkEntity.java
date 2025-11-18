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
@Table(name = "resume_custom_links", indexes = {
        @Index(name = "idx_rcl_resume", columnList = "resume_id")
})
public class ResumeCustomLinkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 255, nullable = false)
    private String title;

    @Column(length = 2048, nullable = false)
    private String url;

    @Version
    private Long version;

    @jakarta.persistence.Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;
}