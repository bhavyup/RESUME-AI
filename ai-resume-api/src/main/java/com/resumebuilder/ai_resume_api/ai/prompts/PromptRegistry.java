package com.resumebuilder.ai_resume_api.ai.prompts;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PromptRegistry {

    private final Map<String, PromptTemplate> registry = new HashMap<>();

    public PromptRegistry() {
        loadDefaults();
    }

    private void loadDefaults() {
        // JSON-safe bullet rewrite (strict)
        String bulletJson = """
                You are an expert resume writer. Rewrite the provided draft into exactly 3 action-oriented bullets.

                Constraints:
                - Strong action verb first
                - Past tense unless ongoing is explicitly stated
                - Avoid first-person ("I", "we")
                - Prefer metrics; if unknown, set metricSuggestion with "~" range
                - Keep each bullet <= 28 words
                - Preserve truth; do not fabricate

                Return STRICT JSON only, no commentary:
                {
                  "bullets": [
                     { "text":"...", "actionVerb":"...", "impact":"...", "metricSuggestion":"~10%", "confidence":"MED", "requiresUserInput": false },
                     { "text":"...", "actionVerb":"...", "impact":"...", "metricSuggestion":null,   "confidence":"MED", "requiresUserInput": true },
                     { "text":"...", "actionVerb":"...", "impact":"...", "metricSuggestion":"~5%",  "confidence":"LOW", "requiresUserInput": false }
                  ]
                }

                JobTitle: {{jobTitle}}
                Draft: "{{draft}}"
                """;

        registry.put("bullet_rewrite_json_v1",
                new PromptTemplate("bullet_rewrite_json_v1", "Bullet Rewrite JSON", "1.0", bulletJson));

        String atsCritique = """
                You are an ATS and resume optimization expert.

                Job Title: {{jobTitle}}

                Job Description:
                {{jobDescription}}

                Candidate Resume (truncated text):
                {{resumeText}}

                Based on common ATS patterns and recruiter best practices, provide a JSON object with improvement suggestions.
                Produce STRICT JSON only (double quotes only, no trailing commas), no commentary, at most 4 items:

                {
                  "suggestions": [
                    {
                      "title": "Concise, actionable title",
                      "description": "Explain what to change and why in 1-2 sentences.",
                      "before": "Optional short snippet before",
                      "after": "Optional improved snippet",
                      "benefit": "Describe expected impact (e.g., 'Improves keyword match by ~8%')"
                    }
                  ]
                }

                Constraints:
                - Do not fabricate experiences; keep changes realistic.
                - Prefer specific, measurable outcomes and relevant keywords.
                - Keep 'after' snippets 1-2 lines each.
                - Focus on top 3-5 changes with biggest impact.
                """;
        registry.put("ats_critique_json_v1",
                new PromptTemplate("ats_critique_json_v1", "ATS Critique JSON", "1.0", atsCritique));

        String tailorPatch = """
                You are a resume optimization expert. Tailor the resume to the job below using ONLY the provided context (do not invent experience).

                Job Description:
                {{jobDescription}}

                Target keywords (highest priority to include naturally in bullets):
                {{targetKeywords}}

                Relevant Resume Chunks (ranked; each line shows section/refType plus id=<entityId> and idx=<bulletIndex> when applicable):
                {{context}}

                Produce STRICT JSON only (double quotes only, no trailing commas).
                Requirements:
                - Return between 3 and 5 bulletPatches when at least one EXPERIENCE or PROJECT line exists.
                - Each bulletPatch must use a distinct original (no duplicates).
                - Prefer bullet-like context lines (EXPERIENCE_BULLET or EXPERIENCE_ACHIEVEMENT). If none, you may derive from HEADER/TECH_STACK/DESC lines.
                - atsScoreBefore and atsScoreAfter must be integers 0–100 (best estimate).
                - Each bullet patch must include 2–3 concise variants.
                - Each variant must naturally include at least one of: {{targetKeywords}} (or a highly relevant term from the job description).
                - Only include "entityId" and "bulletIndex" if they appear exactly in the context as id=<number> and idx=<number>; otherwise omit bulletIndex.
                - Include "sourceRanks": [rankNumbers] to indicate which context lines you used for each patch.
                - Do not fabricate new experiences.
                - Do not create patches from HEADER lines (refType ending in "_HEADER"); skip those lines entirely.
                - Do not create patches from TECH_STACK lines (refType ending in “_TECH_STACK”) or identity lines (HEADER). Use only narrative sources (bullets/achievements/descriptions/features/outcomes).

                JSON shape:
                {
                  "atsScoreBefore": 90,
                  "atsScoreAfter": 90,
                  "globalKeywordsToAdd": ["keyword1","keyword2"],
                  "globalKeywordsMissing": ["keyword3"],
                  "bulletPatches": [
                    {
                      "section": "EXPERIENCE",
                      "entityId": 123,          // only if id tag present
                      "bulletIndex": 0,         // only if idx tag present
                      "original": "Original bullet from context",
                      "variants": [
                        "Action-first bullet that includes one target keyword naturally.",
                        "Second variant, also includes one target keyword."
                      ],
                      "keywordsAdded": ["keyword4","keyword5"],
                      "sourceRanks": [1, 3]
                    }
                  ],
                  "sectionOrderSuggested": ["SUMMARY","EXPERIENCE","PROJECTS","EDUCATION","SKILLS"]
                }
                """;
        registry.put("tailor_patch_json_v1",
                new PromptTemplate("tailor_patch_json_v1", "Tailor Patch JSON", "1.2", tailorPatch));

        String tailorSingle = """
                You are a resume tailoring assistant.

                Job Description:
                {{jobDescription}}

                Target keywords (prioritize natural inclusion):
                {{targetKeywords}}

                Context line (ranked) with tags:
                {{lineTag}}
                Text:
                "{{content}}"

                Produce STRICT JSON only (double quotes only, no trailing commas). Create ONE bullet patch from this line.
                Requirements:
                - 2 concise bullet variants (<= 28 words each).
                - Each variant must naturally include at least one of: {{targetKeywords}} (or a clearly equivalent term from the JD).
                - If the line shows id=<entityId> and idx=<bulletIndex>, include them; otherwise omit bulletIndex.
                - Do NOT include meta words or placeholders like "Action-first", "=>", "words", "less than", or any commentary.

                {
                  "patch": {
                    "section": "EXPERIENCE",
                    "entityId": 123,          // include ONLY if id tag present
                    "bulletIndex": 0,         // include ONLY if idx tag present
                    "original": "{{content}}",
                    "variants": [
                      "Impact-focused bullet that naturally includes a target keyword.",
                      "Second bullet variant that also includes a target keyword."
                    ],
                    "keywordsAdded": ["python","flask"],
                    "sourceRanks": [{{rank}}]
                  }
                }
                """;
        registry.put("tailor_single_patch_json_v1",
                new PromptTemplate("tailor_single_patch_json_v1", "Tailor Single Patch JSON", "1.1", tailorSingle));
    }

    public PromptTemplate get(String id) {
        var p = registry.get(id);
        if (p == null)
            throw new IllegalArgumentException("Prompt not found: " + id);
        return p;
    }

    public Map<String, PromptTemplate> all() {
        return Map.copyOf(registry);
    }
}