package com.resumebuilder.ai_resume_api.ai;

import java.util.List;
import java.util.Map;

public record AiTextResult(
        String content, // cleaned text or json string
        String raw, // raw provider text
        String provider,
        String model,
        long latencyMs,
        boolean cached,
        Map<String, Object> providerMeta, // eval_count, durations etc.
        List<String> warnings) {
}   