package com.resumebuilder.ai_resume_api.entity.embedded;

import com.resumebuilder.ai_resume_api.enums.VolunteerLinkType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class VolunteerLink {

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", length = 16)
    private VolunteerLinkType type;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "url", length = 2048)
    private String url;
}