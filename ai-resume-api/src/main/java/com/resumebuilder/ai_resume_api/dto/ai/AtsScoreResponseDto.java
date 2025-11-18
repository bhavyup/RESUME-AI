package com.resumebuilder.ai_resume_api.dto.ai;

import java.util.List;

public record AtsScoreResponseDto(
        int totalScore, // 0..100
        List<AtsCriterionScoreDto> breakdown, // per-criterion scores
        List<String> extractedKeywords, // top N JD keywords
        List<String> matchedKeywords, // found in resume
        List<String> missingKeywords, // not found in resume
        List<AtsSuggestionDto> suggestions, // from LLM critique (structured)
        String provider, // "Ollama"
        String model, // actual model used
        Long latencyMs, // LLM critique latency (heuristics run local instantly)
        String promptVersion // ATS prompt version
) {
}