package com.resumebuilder.ai_resume_api.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class ModelSelector {

    private final String primary;
    private final String secondary;
    private final String fallback;
    private final String tiny;

    public ModelSelector(
            @Value("${ai.ollama.model.primary:qwen2.5:3b-instruct}") String primary,
            @Value("${ai.ollama.model.secondary:gemma2:2b}") String secondary,
            @Value("${ai.ollama.model.fallback:llama3.2:1b}") String fallback,
            @Value("${ai.ollama.model.tiny:tinyllama:1.1b}") String tiny) {
        this.primary = primary;
        this.secondary = secondary;
        this.fallback = fallback;
        this.tiny = tiny;
    }

    /**
     * Build an ordered list of model IDs to try.
     * preferred can be:
     * - "primary" | "secondary" | "fallback" | "tiny"
     * - a raw model id (e.g., "qwen2.5:3b-instruct")
     * - null (default order)
     */
    public List<String> ordered(String preferred) {
        Set<String> order = new LinkedHashSet<>();
        if (preferred != null && !preferred.isBlank()) {
            switch (preferred.toLowerCase()) {
                case "primary" -> order.add(primary);
                case "secondary" -> order.add(secondary);
                case "fallback" -> order.add(fallback);
                case "tiny" -> order.add(tiny);
                default -> order.add(preferred); // treat as raw model id
            }
        }
        // append defaults in stable order, dedup automatically
        if (primary != null && !primary.isBlank())
            order.add(primary);
        if (secondary != null && !secondary.isBlank())
            order.add(secondary);
        if (fallback != null && !fallback.isBlank())
            order.add(fallback);
        if (tiny != null && !tiny.isBlank())
            order.add(tiny);

        return new ArrayList<>(order);
    }
}