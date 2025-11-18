package com.resumebuilder.ai_resume_api.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai_resume_api.ai.AIOrchestrator;
import com.resumebuilder.ai_resume_api.dto.ai.BulletRewriteRequestDto;
import com.resumebuilder.ai_resume_api.dto.ai.BulletRewriteResponseDto;
import com.resumebuilder.ai_resume_api.dto.ai.BulletSuggestionDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BulletRewriterService {

    private final AIOrchestrator orchestrator;
    private final ObjectMapper mapper = new ObjectMapper();

    public BulletRewriterService(AIOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    public BulletRewriteResponseDto rewrite(BulletRewriteRequestDto req, String preferredModelKey) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("jobTitle", req.jobTitle());
        vars.put("draft", redactPII(req.draft()));

        var ai = orchestrator.generate(
                "bullet_rewrite_json_v1",
                vars,
                preferredModelKey, // may be null or "primary"/"secondary"/"tiny"/raw model id
                Map.of("temperature", 0.5, "num_predict", 400),
                true // expectJson
        );

        List<BulletSuggestionDto> bullets = parseBullets(ai.content());
        List<String> warnings = new ArrayList<>();

        // Validation rules
        if (bullets.size() != 3)
            warnings.add("Expected exactly 3 bullets, got " + bullets.size());
        for (int i = 0; i < bullets.size(); i++) {
            var b = bullets.get(i);
            if (b.text() == null || b.text().isBlank()) {
                warnings.add("Bullet " + (i + 1) + " is empty.");
                continue;
            }
            int words = wordCount(b.text());
            if (words > 28)
                warnings.add("Bullet " + (i + 1) + " exceeds 28 words (" + words + ").");
            if (containsFirstPerson(b.text()))
                warnings.add("Bullet " + (i + 1) + " uses first-person language.");
            if (!startsWithActionVerb(b.text()))
                warnings.add("Bullet " + (i + 1) + " may not start with a strong verb.");
        }

        double confidence = 0.95 - 0.10 * warnings.size();
        if (confidence < 0.50)
            confidence = 0.50;
        if (bullets.isEmpty())
            confidence = 0.40;

        return new BulletRewriteResponseDto(
                req.jobTitle(),
                req.draft(),
                bullets,
                confidence,
                warnings,
                ai.provider(),
                ai.model(),
                ai.latencyMs(),
                "1.0",
                ai.content());
    }

    private int wordCount(String s) {
        var trimmed = s == null ? "" : s.trim();
        if (trimmed.isEmpty())
            return 0;
        return trimmed.split("\\s+").length;
    }

    private boolean containsFirstPerson(String s) {
        String t = s.toLowerCase();
        return t.contains(" i ") || t.startsWith("i ") || t.contains(" my ") || t.contains(" we ")
                || t.startsWith("we ");
    }

    private boolean startsWithActionVerb(String s) {
        if (s == null || s.isBlank())
            return false;
        String first = s.trim().split("\\s+")[0].replaceAll("[^A-Za-z]", "");
        // Minimal set; expand later or load from list
        String[] verbs = { "Led", "Improved", "Optimized", "Built", "Delivered", "Implemented", "Developed", "Designed",
                "Launched", "Automated", "Reduced", "Increased" };
        for (String v : verbs) {
            if (first.equalsIgnoreCase(v))
                return true;
        }
        return Character.isUpperCase(first.isEmpty() ? 'A' : first.charAt(0)); // lenient fallback
    }

    private List<BulletSuggestionDto> parseBullets(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode arr = root.path("bullets");
            if (!arr.isArray() || arr.size() == 0)
                return List.of();

            List<BulletSuggestionDto> out = new ArrayList<>();
            for (var n : arr) {
                out.add(new BulletSuggestionDto(
                        n.path("text").asText(""),
                        n.path("actionVerb").asText(null),
                        n.path("impact").asText(null),
                        n.path("metricSuggestion").isMissingNode() || n.path("metricSuggestion").isNull()
                                ? null
                                : n.path("metricSuggestion").asText(),
                        n.path("confidence").asText("MED"),
                        n.path("requiresUserInput").asBoolean(false)));
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    // Basic local redaction before sending any text to the model
    private String redactPII(String s) {
        if (s == null)
            return null;
        String out = s;
        out = out.replaceAll("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", "[EMAIL]");
        out = out.replaceAll("\\+?\\d[\\d()\\-\\s]{6,}\\d", "[PHONE]");
        out = out.replaceAll("https?://\\S+", "[URL]");
        return out;
    }
}