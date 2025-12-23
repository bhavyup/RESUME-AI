package com.resumebuilder.ai_resume_api.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai_resume_api.ai.prompts.PromptRegistry;
import com.resumebuilder.ai_resume_api.ai.prompts.PromptTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class AIOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(AIOrchestrator.class);

    private final List<AiProvider> providers;
    private final PromptRegistry prompts;
    private final ModelSelector modelSelector;
    private final ObjectMapper mapper = new ObjectMapper();

    public AIOrchestrator(List<AiProvider> providers, PromptRegistry prompts, ModelSelector modelSelector) {
        this.providers = providers;
        this.prompts = prompts;
        this.modelSelector = modelSelector;
    }

    /**
     * preferredModel can be:
     * - "primary" | "secondary" | "fallback" | "tiny"
     * - raw model id (e.g., "qwen2.5:3b-instruct")
     * - null (default order from properties)
     */
    public AiTextResult generate(String promptId,
            Map<String, Object> variables,
            String preferredModel,
            Map<String, Object> options,
            boolean expectJson) {

        PromptTemplate pt = prompts.get(promptId);
        String prompt = pt.render(variables);
        var provider = selectProvider();

        List<String> candidates = modelSelector.ordered(preferredModel);
        RuntimeException lastError = null;

        for (String model : candidates) {
            try {
                var req = new AiTextRequest(model, prompt, false, expectJson ? "json" : null,
                        Map.of("promptId", promptId, "promptVersion", pt.version()));

                log.debug("AI generate: provider={}, promptId={}, version={}, tryModel={}",
                        provider.providerName(), promptId, pt.version(), model);

                AiTextResult res = provider.generate(req, options);

                String content = res.content();
                if (expectJson) {
                    try {
                        validateJson(content);
                    } catch (Exception bad) {
                        // Attempt a single repair pass
                        String repaired = com.resumebuilder.ai_resume_api.util.JsonRepairUtil.tryRepair(content);
                        validateJson(repaired); // throws if still invalid
                        content = repaired;
                    }
                }

                // success
                return new AiTextResult(
                        content,
                        res.raw(),
                        res.provider(),
                        model,
                        res.latencyMs(),
                        false,
                        res.providerMeta(),
                        res.warnings());
            } catch (Exception ex) {
                lastError = new RuntimeException("Model failed: " + model + " -> " + ex.getMessage(), ex);
                log.warn("AI attempt failed for model {}. Trying next if available. Cause={}", model, ex.toString());
            }
        }

        throw (lastError != null ? lastError : new IllegalStateException("All models failed"));
    }

    private AiProvider selectProvider() {
        return providers.stream()
                .filter(AiProvider::isHealthy)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No healthy AI provider available"));
    }

    private void validateJson(String body) {
        try {
            JsonNode node = mapper.readTree(body);
            if (!node.isObject()) {
                throw new IllegalStateException("Expected JSON object at root");
            }
        } catch (Exception e) {
            throw new IllegalStateException("Provider did not return valid JSON: " + e.getMessage(), e);
        }
    }

    public static String hashKey(String input) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            var dig = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(dig);
        } catch (Exception e) {
            return Integer.toHexString(input.hashCode());
        }
    }
}