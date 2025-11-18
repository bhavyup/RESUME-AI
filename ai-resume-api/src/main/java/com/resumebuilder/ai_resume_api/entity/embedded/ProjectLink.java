package com.resumebuilder.ai_resume_api.entity.embedded;

import com.resumebuilder.ai_resume_api.enums.ProjectLinkType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class ProjectLink {
    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", length = 32)
    private ProjectLinkType type;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "url", length = 2048)
    private String url;
}