package com.resumebuilder.ai_resume_api.entity.resume;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "resume", "skills" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "skill_categories", uniqueConstraints = {
        @UniqueConstraint(name = "uk_skill_category_name", columnNames = { "resume_id", "name" })
}, indexes = {
        @Index(name = "idx_sc_resume", columnList = "resume_id")
})
public class SkillCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(length = 128, nullable = false)
    private String name;

    @Column(name = "is_predefined", nullable = false)
    private boolean isPredefined = false;

    @Version
    private Long version;

    @jakarta.persistence.Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "resume_id", nullable = false)
    @JsonIgnore
    private ResumeEntity resume;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @OrderBy("displayOrder ASC, id ASC")
    private List<SkillEntity> skills = new ArrayList<>();
}