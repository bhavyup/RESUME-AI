package com.resumebuilder.ai_resume_api.service.ai;

import com.resumebuilder.ai_resume_api.dto.ai.GrammarCheckRequestDto;
import com.resumebuilder.ai_resume_api.dto.ai.GrammarCheckResponseDto;
import com.resumebuilder.ai_resume_api.dto.ai.GrammarIssueDto;
import org.languagetool.JLanguageTool;
import org.languagetool.language.AmericanEnglish;
import org.languagetool.rules.RuleMatch;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class GrammarService {

    // Lazy-loaded to avoid startup crashes; LanguageTool is thread-safe for check()
    // calls
    private JLanguageTool lt;
    private boolean initialized = false;
    private String initError = null;

    @PostConstruct
    public void init() {
        try {
            // Increase XML entity size limit for LanguageTool's large grammar files
            System.setProperty("jdk.xml.totalEntitySizeLimit", "0"); // unlimited
            System.setProperty("jdk.xml.entityExpansionLimit", "0");

            this.lt = new JLanguageTool(new AmericanEnglish());
            this.initialized = true;
            System.out.println("✓ LanguageTool initialized successfully");
        } catch (Exception e) {
            this.initError = "LanguageTool failed to initialize: " + e.getMessage();
            // Don't crash the app - just log and make grammar checking unavailable
            System.err.println("WARNING: " + initError);
            e.printStackTrace();
            this.initialized = false;
        }
    }

    public GrammarCheckResponseDto check(GrammarCheckRequestDto req) {
        if (!initialized) {
            // Return empty result if LanguageTool isn't available
            System.err.println("Grammar check called but LanguageTool not initialized: " + initError);
            return new GrammarCheckResponseDto(0, List.of());
        }

        String text = req.text();
        try {
            List<RuleMatch> matches = lt.check(text);
            List<GrammarIssueDto> issues = new ArrayList<>();
            for (RuleMatch m : matches) {
                String ctx = excerpt(text, m.getFromPos(), m.getToPos(), 40);
                List<String> repl = m.getSuggestedReplacements();
                issues.add(new GrammarIssueDto(
                        m.getRule().getId(),
                        m.getMessage(),
                        m.getFromPos(),
                        m.getToPos() - m.getFromPos(),
                        ctx,
                        repl != null ? repl : List.of()));
            }
            return new GrammarCheckResponseDto(issues.size(), issues);
        } catch (IOException e) {
            throw new RuntimeException("Grammar check failed: " + e.getMessage(), e);
        }
    }

    private String excerpt(String text, int from, int to, int radius) {
        int start = Math.max(0, from - radius);
        int end = Math.min(text.length(), to + radius);
        String snippet = text.substring(start, end);

        // mark the error span safely
        int relFrom = from - start;
        int relTo = to - start;

        if (relFrom >= 0 && relFrom < snippet.length() && relTo > relFrom && relTo <= snippet.length()) {
            return snippet.substring(0, relFrom) +
                    "[[" + text.substring(from, to) + "]]" +
                    snippet.substring(relTo);
        }

        return snippet; // fallback if indices are wonky
    }

    public boolean isAvailable() {
        return initialized;
    }

    public String getInitError() {
        return initError;
    }
}