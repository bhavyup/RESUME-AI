package com.resumebuilder.ai_resume_api.entity.embedded;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class EducationProjectLink {
    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "url", length = 1024)
    private String url;
}