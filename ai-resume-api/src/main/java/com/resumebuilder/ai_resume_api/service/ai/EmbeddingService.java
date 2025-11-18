package com.resumebuilder.ai_resume_api.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private final WebClient client;
    @SuppressWarnings("unused")
    private final String base;
    private final String model;

    public EmbeddingService(@Value("${ai.ollama.base:http://localhost:11434}") String base,
            @Value("${ai.embeddings.model:nomic-embed-text}") String model,
            org.springframework.web.reactive.function.client.WebClient.Builder builder) {
        this.base = base;
        this.model = model;
        this.client = builder.baseUrl(base).build();
    }

    public float[] embed(String text) {
        var payload = Map.of("model", model, "prompt", text);
        var res = client.post()
                .uri("/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(30))
                .block();
        if (res == null || !res.containsKey("embedding")) {
            throw new IllegalStateException("Embedding API returned null");
        }
        Object embeddingObj = res.get("embedding");
        if (!(embeddingObj instanceof List)) {
            throw new IllegalStateException("Embedding API returned invalid payload: expected list");
        }
        List<?> arr = (List<?>) embeddingObj;
        float[] out = new float[arr.size()];
        for (int i = 0; i < arr.size(); i++) {
            Object v = arr.get(i);
            if (!(v instanceof Number)) {
                throw new IllegalStateException("Embedding API returned non-numeric value at index " + i);
            }
            out[i] = ((Number) v).floatValue();
        }
        return out;
    }
}