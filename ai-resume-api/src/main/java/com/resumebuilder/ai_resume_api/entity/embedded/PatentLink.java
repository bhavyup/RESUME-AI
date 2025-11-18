package com.resumebuilder.ai_resume_api.entity.embedded;

import com.resumebuilder.ai_resume_api.enums.PatentLinkType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class PatentLink {
    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", length = 32)
    private PatentLinkType type;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "url", length = 2048)
    private String url;
}