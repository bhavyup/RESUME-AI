package com.resumebuilder.ai_resume_api.ai;

import java.util.Map;

public record AiTextRequest(
        String model,
        String prompt,
        boolean stream,
        String format, // "json" when we want structured output
        Map<String, Object> meta // optional: userId, resumeId, promptKey, version
) {
}