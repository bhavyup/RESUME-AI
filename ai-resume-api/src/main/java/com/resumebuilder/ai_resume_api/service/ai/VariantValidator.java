package com.resumebuilder.ai_resume_api.service.ai;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class VariantValidator {

    // Patterns for resume voice violations
    private static final Pattern JOB_SEEKING = Pattern.compile(
            "(?i)^\\s*(looking for|seeking|i am|i'm|we are|we're|interested in|hoping to|want to join)\\b",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern FIRST_PERSON = Pattern.compile(
            "(?i)^\\s*(i |my |we |our |me |us )\\b",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern META_TEXT = Pattern.compile(
            "(?i)\\b(action[- ]?first|impact[- ]?focused|words?|less than|greater than|example|sample|placeholder|template|=>|```math|```)\\b",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern BUZZWORDS = Pattern.compile(
            "(?i)\\b(synergy|leverage|paradigm|disrupt|ninja|rockstar|guru|thought leader|game[- ]?changer)\\b",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern QUOTE_WRAPPED = Pattern.compile("^\\s*[\"'](.+?)[\"']\\s*$");

    /**
     * Clean and validate a list of variants with strict resume-voice rules
     *
     * @param variants raw variants from model
     * @return cleaned, valid variants (resume voice only)
     */
    public List<String> cleanVariants(List<String> variants) {
        if (variants == null)
            return List.of();

        List<String> cleaned = new ArrayList<>();
        for (String v : variants) {
            if (v == null || v.isBlank())
                continue;

            String clean = cleanSingle(v);
            if (clean != null && !clean.isBlank() && isValidResumeVoice(clean)) {
                cleaned.add(clean);
            }
        }
        return cleaned;
    }

    /**
     * Clean a single variant string
     */
    private String cleanSingle(String v) {
        String s = v;

        // Strip quote wrappers
        var quoteMatcher = QUOTE_WRAPPED.matcher(s);
        if (quoteMatcher.matches()) {
            s = quoteMatcher.group(1);
        }

        // Remove meta commentary
        s = META_TEXT.matcher(s).replaceAll("");

        // Remove job-seeking prefixes
        s = JOB_SEEKING.matcher(s).replaceAll("");

        // Strip arrows and everything after (common model artifact)
        s = s.replaceAll("=>.*$", "");
        s = s.replaceAll("=>.*$", "");
        s = s.replaceAll("(?s)```math.*?```", ""); // remove bracketed placeholders
        // Remove first-person starts
        var fpMatcher = FIRST_PERSON.matcher(s);
        if (fpMatcher.find()) {
            s = fpMatcher.replaceAll("");
        }

        // Normalize whitespace
        s = s.replaceAll("\\s+", " ").trim();

        // Remove leading/trailing punctuation debris
        s = s.replaceAll("^[,;:\\-\\s]+", "").replaceAll("[,;:\\s]+$", "");

        return s;
    }

    /**
     * Check if text is valid resume voice (after cleaning)
     */
    private boolean isValidResumeVoice(String text) {
        if (text == null || text.isBlank())
            return false;
        if (text.length() < 15)
            return false; // too short to be a real bullet

        String lower = text.toLowerCase(Locale.ROOT);

        // Reject job-seeking voice
        if (JOB_SEEKING.matcher(lower).find())
            return false;

        // Reject first-person (start OR anywhere in text)
        if (FIRST_PERSON.matcher(lower).find())
            return false;

        // Also check for first-person anywhere in text (not just start)
        if (lower.contains(" my ") || lower.contains(" i ") || lower.contains(" we ") ||
                lower.contains(" our ") || lower.contains(" me "))
            return false;

        // Also check for offensive content
        if (lower.contains(" my ") || lower.contains(" i ") || lower.contains(" we ") ||
                lower.contains(" our ") || lower.contains(" me "))
            return false;

        // Reject if still contains meta/placeholder text
        if (lower.contains("action-first") || lower.contains("impact-focused"))
            return false;
        if (lower.contains("example") || lower.contains("placeholder"))
            return false;

        // Reject obvious buzzwords
        if (BUZZWORDS.matcher(lower).find())
            return false;

        // NEW: Reject malformed sentences
        if (text.matches(".*[.!?]\\s+using\\s+\\w+.*"))
            return false; // ". using keyword"
        if (text.matches(".*\\s+using\\s+\\w+\\s*$"))
            return false; // ends with "using keyword"

        // NEW: Reject if starts with lowercase (unless number)
        char first = text.charAt(0);
        if (Character.isLetter(first) && Character.isLowerCase(first))
            return false;

        // NEW: Reject if contains multiple spaces or weird punctuation
        if (text.contains("  "))
            return false; // double space
        if (text.matches(".*[.!?]{2,}.*"))
            return false; // multiple punctuation

        // NEW: Reject if no verb in first 5 words (likely malformed)
        String[] firstWords = text.split("\\s+");
        if (firstWords.length < 3)
            return false; // too short

        // Must start with capital letter or number (resume bullets convention)
        if (!Character.isUpperCase(first) && !Character.isDigit(first))
            return false;

        return true;
    }

    /**
     * Validate if at least one variant contains a target keyword
     */
    public boolean containsAnyKeyword(List<String> variants, List<String> keywords) {
        if (variants == null || keywords == null)
            return false;
        for (String v : variants) {
            String lv = v.toLowerCase(Locale.ROOT);
            for (String k : keywords) {
                if (lv.contains(k.toLowerCase(Locale.ROOT)))
                    return true;
            }
        }
        return false;
    }

    /**
     * Gently inject first keyword into variants if missing (fallback only)
     */
    public List<String> injectKeywordIfMissing(List<String> variants, List<String> keywords) {
        if (variants == null || variants.isEmpty() || keywords == null || keywords.isEmpty()) {
            return variants == null ? List.of() : variants;
        }

        if (containsAnyKeyword(variants, keywords)) {
            return variants; // already has keywords
        }

        String firstKw = keywords.get(0);
        List<String> out = new ArrayList<>(variants.size());
        boolean injected = false;

        for (String v : variants) {
            if (!injected && !v.toLowerCase(Locale.ROOT).contains(firstKw.toLowerCase(Locale.ROOT))) {
                // Gentle end-injection
                out.add((v + " using " + firstKw).trim());
                injected = true;
            } else {
                out.add(v);
            }
        }
        return out;
    }

    /**
     * Check for specific word count limit
     */
    public boolean exceedsWordLimit(String variant, int maxWords) {
        if (variant == null)
            return false;
        int words = variant.trim().split("\\s+").length;
        return words > maxWords;
    }

    /**
     * Get validation warnings for a variant
     */
    public List<String> getWarnings(String variant) {
        List<String> warnings = new ArrayList<>();
        if (variant == null || variant.isBlank()) {
            warnings.add("Empty variant");
            return warnings;
        }

        if (exceedsWordLimit(variant, 28)) {
            warnings.add("Exceeds 28 words");
        }

        if (JOB_SEEKING.matcher(variant).find()) {
            warnings.add("Job-seeking voice detected");
        }

        if (FIRST_PERSON.matcher(variant).find()) {
            warnings.add("First-person language detected");
        }

        if (BUZZWORDS.matcher(variant).find()) {
            warnings.add("Contains buzzwords");
        }

        return warnings;
    }
}