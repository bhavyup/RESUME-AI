package com.resumebuilder.ai_resume_api.dto.ai;

import java.util.List;

public record BulletRewriteResponseDto(
        String jobTitle,
        String draft,
        List<BulletSuggestionDto> bullets,

        Double confidence,
        List<String> warnings,

        String provider,
        String model,
        Long latencyMs,
        String promptVersion,

        String raw // raw JSON returned by the model (useful for debugging)
) {
}