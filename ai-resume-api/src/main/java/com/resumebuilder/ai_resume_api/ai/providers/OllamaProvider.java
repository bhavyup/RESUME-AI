package com.resumebuilder.ai_resume_api.ai.providers;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.resumebuilder.ai_resume_api.ai.AiProvider;
import com.resumebuilder.ai_resume_api.ai.AiTextRequest;
import com.resumebuilder.ai_resume_api.ai.AiTextResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OllamaProvider implements AiProvider {

    private final WebClient client;
    @SuppressWarnings("unused")
    private final String baseUrl;
    private final String defaultModel;

    public OllamaProvider(@Value("${ai.ollama.base:http://localhost:11434}") String baseUrl,
            @Value("${ai.ollama.model.primary:qwen2.5:3b-instruct}") String defaultModel,
            WebClient.Builder builder) {
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;
        this.client = builder.baseUrl(baseUrl).build();
    }

    @Override
    public AiTextResult generate(AiTextRequest req, Map<String, Object> options) {
        long start = System.currentTimeMillis();

        String model = (req.model() != null && !req.model().isBlank()) ? req.model() : defaultModel;

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("prompt", req.prompt());
        payload.put("stream", false);
        if (options != null)
            payload.put("options", options);
        if (req.format() != null && !req.format().isBlank())
            payload.put("format", req.format());

        var res = client.post()
                .uri("/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .timeout(Duration.ofSeconds(130))
                .block();

        long latency = System.currentTimeMillis() - start;

        String text = res != null && res.response != null ? res.response.trim() : "";
        Map<String, Object> meta = Map.of(
                "total_duration", res != null ? res.total_duration : null,
                "eval_count", res != null ? res.eval_count : null,
                "eval_duration", res != null ? res.eval_duration : null);

        return new AiTextResult(text, res != null ? res.response : "",
                "Ollama", model, latency, false, meta, List.of());
    }

    @Override
    public String providerName() {
        return "Ollama";
    }

    @Override
    public boolean isHealthy() {
        try {
            var tags = client.get().uri("/api/tags").retrieve().bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5)).block();
            return tags != null && !tags.isBlank();
        } catch (Exception e) {
            return false;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class OllamaResponse {
        public String model;
        public String response;
        public Boolean done;
        public Long total_duration;
        public Long eval_count;
        public Long eval_duration;
    }
}