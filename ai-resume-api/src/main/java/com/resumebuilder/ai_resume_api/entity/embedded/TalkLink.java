package com.resumebuilder.ai_resume_api.entity.embedded;

import com.resumebuilder.ai_resume_api.enums.TalkLinkType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class TalkLink {

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", length = 16)
    private TalkLinkType type;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "url", length = 2048)
    private String url;
}