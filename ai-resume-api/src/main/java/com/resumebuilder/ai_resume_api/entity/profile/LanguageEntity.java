package com.resumebuilder.ai_resume_api.entity.profile;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Languages")
public class LanguageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String language;
    private String proficiencyLevel; // e.g., "Native", "Fluent", "Intermediate", "Basic"

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "personal_info_id", nullable = false)
    @JsonIgnore
    private PersonalInfoEntity personalInfo;

}
