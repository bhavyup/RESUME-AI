package com.resumebuilder.ai_resume_api.dto.resume;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record ProjectLinkDto(
        @Schema(allowableValues = {
                "REPO", "DEMO", "LIVE", "CASE_STUDY", "VIDEO", "DOCS", "OTHER" }) String type,
        @NotBlank(message = "Title is required") String title,
        @NotBlank(message = "URL is required") String url){
}