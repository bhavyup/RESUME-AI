package com.resumebuilder.ai_resume_api.dto.ai;

import java.util.List;

public record GrammarIssueDto(
        String ruleId,
        String message,
        int offset,
        int length,
        String context, // excerpt with markers
        List<String> replacements // suggested replacements
) {
}