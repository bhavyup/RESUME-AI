package com.resumebuilder.ai_resume_api.dto.ai;

import java.util.List;

public record TailorPlanDto(
        double atsScoreBefore,
        double atsScoreAfter,
        List<String> globalKeywordsToAdd,
        List<String> globalKeywordsMissing,
        List<BulletPatch> bulletPatches, // proposed bullet rewrites
        List<String> sectionOrderSuggested, // optional: section order
        String provider,
        String model,
        Long latencyMs,
        String promptVersion,
        String raw) {
    public record BulletPatch(
            String section, // EXPERIENCE/PROJECT
            Long entityId, // experienceId/projectId (if known)
            Integer bulletIndex, // 0-based if known
            String original,
            List<String> variants,
            List<String> keywordsAdded) {
    }
}