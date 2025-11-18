package com.resumebuilder.ai_resume_api.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumebuilder.ai_resume_api.ai.AIOrchestrator;
import com.resumebuilder.ai_resume_api.dto.ai.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AtsScoringService {

    private final AIOrchestrator orchestrator;
    private final ObjectMapper mapper = new ObjectMapper();

    public AtsScoringService(AIOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    public AtsScoreResponseDto score(Long resumeId, AtsScoreRequestDto req) {
        // 1) Keyword extraction from JD (simple heuristic unless provided)
        List<String> jdKeywords = req.targetKeywords() != null && !req.targetKeywords().isEmpty()
                ? normalizeList(req.targetKeywords())
                : extractKeywords(req.jobDescription(), 20);

        // 2) Match vs resume text
        String resumeText = safe(req.resumeText()).toLowerCase(Locale.ROOT);
        Set<String> inResume = new HashSet<>();
        for (String k : jdKeywords) {
            if (resumeText.contains(k.toLowerCase(Locale.ROOT))) {
                inResume.add(k);
            }
        }
        List<String> matched = jdKeywords.stream().filter(inResume::contains).toList();
        List<String> missing = jdKeywords.stream().filter(k -> !inResume.contains(k)).toList();

        // 3) Heuristics for score breakdown
        int maxKeywords = 40, maxSkills = 20, maxBullets = 15, maxMetrics = 10, maxRecency = 10, maxFormatting = 5;
        int keywordsScore = (int) Math.round(maxKeywords * (matched.size() / (double) Math.max(1, jdKeywords.size())));

        // crude signals
        int skillsScore = (int) Math.round(maxSkills * skillDensity(resumeText));
        int bulletScore = (int) Math.round(maxBullets * bulletQuality(resumeText));
        int metricScore = (int) Math.round(maxMetrics * metricDensity(resumeText));
        int recencyScore = (int) Math.round(maxRecency * recencyHint(resumeText));
        int formattingScore = (int) Math.round(maxFormatting * formattingHealth(resumeText));

        int total = keywordsScore + skillsScore + bulletScore + metricScore + recencyScore + formattingScore;

        List<AtsCriterionScoreDto> breakdown = List.of(
                new AtsCriterionScoreDto("keywords", keywordsScore, maxKeywords, "Coverage of JD keywords"),
                new AtsCriterionScoreDto("skills", skillsScore, maxSkills, "Frequency of tech terms"),
                new AtsCriterionScoreDto("bullets", bulletScore, maxBullets, "Action-verb starts and length"),
                new AtsCriterionScoreDto("metrics", metricScore, maxMetrics, "Quantified impact density"),
                new AtsCriterionScoreDto("recency", recencyScore, maxRecency, "Recent dates like 2023–2025 present"),
                new AtsCriterionScoreDto("formatting", formattingScore, maxFormatting,
                        "No first-person, minimal noise"));

        // 4) LLM critique for suggestions (structured JSON)
        String truncated = truncate(req.resumeText(), 6000); // keep prompt small
        Map<String, Object> vars = new HashMap<>();
        vars.put("jobTitle", req.jobTitle());
        vars.put("jobDescription", truncate(req.jobDescription(), 6000));
        vars.put("resumeText", truncated);

        var ai = orchestrator.generate(
                "ats_critique_json_v1",
                vars,
                req.model(), // preferred model route or null
                Map.of("temperature", 0.3, "num_predict", 900, "top_p", 0.9),
                true);

        List<AtsSuggestionDto> suggestions = parseSuggestions(ai.content());

        return new AtsScoreResponseDto(
                clamp(total, 0, 100),
                breakdown,
                jdKeywords,
                matched,
                missing,
                suggestions,
                ai.provider(),
                ai.model(),
                ai.latencyMs(),
                "1.0");
    }

    // ----------------- Heuristics -----------------

    private static final Set<String> STOP = Set.of(
            "the", "and", "for", "with", "that", "from", "this", "have", "has", "had", "into", "your", "you", "are",
            "our", "their",
            "will", "can", "able", "using", "use", "used", "such", "about", "over", "under", "within", "without", "per",
            "etc",
            "a", "an", "to", "in", "of", "by", "as", "on", "at", "be", "is", "was", "were", "or", "it", "we", "they",
            "i", "my", "me");

    private List<String> extractKeywords(String text, int limit) {
        if (text == null)
            return List.of();
        String[] tokens = text.toLowerCase(Locale.ROOT).split("[^a-z0-9+.#/\\-]+");
        Map<String, Integer> freq = new HashMap<>();
        for (String t : tokens) {
            String k = t.trim();
            if (k.length() < 3)
                continue;
            if (STOP.contains(k))
                continue;
            freq.merge(k, 1, Integer::sum);
        }
        return freq.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private double skillDensity(String text) {
        // crude: count separators and known tech markers
        int hits = 0;
        if (text.contains("spring"))
            hits++;
        if (text.contains("java"))
            hits++;
        if (text.contains("aws"))
            hits++;
        if (text.contains("docker"))
            hits++;
        if (text.contains("kubernetes"))
            hits++;
        if (text.contains("postgres"))
            hits++;
        return Math.min(1.0, hits / 6.0);
    }

    private double bulletQuality(String text) {
        // crude: lines starting with action verbs and short length
        String[] lines = text.split("\\r?\\n");
        int good = 0, total = 0;
        Pattern p = Pattern.compile("^(•|\\-|\\*)?\\s*[A-Z][a-z]+\\b");
        for (String l : lines) {
            if (l.trim().isEmpty())
                continue;
            total++;
            if (p.matcher(l).find() && wordCount(l) <= 28)
                good++;
        }
        if (total == 0)
            return 0.4;
        return Math.min(1.0, good / (double) total);
    }

    private double metricDensity(String text) {
        int count = 0;
        var m1 = Pattern.compile("\\b\\d+%").matcher(text);
        while (m1.find())
            count++;
        var m2 = Pattern.compile("\\b\\d{2,}").matcher(text);
        while (m2.find())
            count++;
        return Math.min(1.0, count / 10.0);
    }

    private double recencyHint(String text) {
        // if it mentions 2023, 2024, 2025 -> good
        int hits = 0;
        if (text.contains("2025"))
            hits++;
        if (text.contains("2024"))
            hits++;
        if (text.contains("2023"))
            hits++;
        return Math.min(1.0, hits / 2.0);
    }

    private double formattingHealth(String text) {
        // penalize first-person and noisy symbols
        double score = 1.0;
        String t = text.toLowerCase(Locale.ROOT);
        if (t.contains(" i ") || t.startsWith("i "))
            score -= 0.3;
        int hashes = count(text, '#');
        if (hashes > 5)
            score -= 0.2;
        return Math.max(0.0, score);
    }

    // ----------------- Helpers -----------------

    private List<AtsSuggestionDto> parseSuggestions(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode arr = root.path("suggestions");
            if (!arr.isArray())
                return List.of();
            List<AtsSuggestionDto> out = new ArrayList<>();
            for (var n : arr) {
                out.add(new AtsSuggestionDto(
                        n.path("title").asText(null),
                        n.path("description").asText(null),
                        n.path("before").isMissingNode() ? null : n.path("before").asText(null),
                        n.path("after").isMissingNode() ? null : n.path("after").asText(null),
                        n.path("benefit").asText(null)));
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    private String truncate(String s, int max) {
        if (s == null)
            return "";
        return s.length() <= max ? s : s.substring(0, max);
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private int wordCount(String s) {
        String t = safe(s).trim();
        return t.isEmpty() ? 0 : t.split("\\s+").length;
    }

    private int count(String s, char c) {
        int n = 0;
        for (int i = 0; i < s.length(); i++)
            if (s.charAt(i) == c)
                n++;
        return n;
    }

    private int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private List<String> normalizeList(List<String> list) {
        if (list == null)
            return List.of();
        return list.stream().filter(Objects::nonNull).map(s -> s.trim().toLowerCase(Locale.ROOT))
                .filter(s -> !s.isEmpty()).toList();
    }
}