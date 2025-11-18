package com.resumebuilder.ai_resume_api.entity.embedded;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class ProjectMedia {
    @Column(name = "image_url", length = 2048, nullable = false)
    private String imageUrl;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "thumbnail_url", length = 2048)
    private String thumbnailUrl;
}