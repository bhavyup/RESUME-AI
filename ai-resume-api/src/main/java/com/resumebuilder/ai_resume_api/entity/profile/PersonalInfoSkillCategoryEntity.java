package com.resumebuilder.ai_resume_api.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "personalInfo", "skills" })
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "personal_info_skill_categories", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pi_skill_category_name", columnNames = { "personal_info_id", "name" })
}, indexes = {
        @Index(name = "idx_pi_sc_personal_info", columnList = "personal_info_id")
})
public class PersonalInfoSkillCategoryEntity {

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

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private java.time.Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "personal_info_id", nullable = false)
    @JsonIgnore
    private PersonalInfoEntity personalInfo;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @OrderBy("displayOrder ASC, id ASC")
    private List<PersonalInfoSkillEntity> skills = new ArrayList<>();

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