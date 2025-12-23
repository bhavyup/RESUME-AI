package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

public record TalkLinkDto(
        @Schema(allowableValues = {
                "SLIDES", "VIDEO", "EVENT", "REPO", "DEMO", "PHOTOS", "PRESS", "OTHER"
        }) String type,
        @Size(max = 255) String title,
        @Size(max = 2048) String url){
}