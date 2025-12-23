package com.resumebuilder.ai_resume_api.ai;

import java.util.Map;

public interface AiProvider {
    AiTextResult generate(AiTextRequest req, Map<String, Object> options);

    String providerName();

    boolean isHealthy();
}