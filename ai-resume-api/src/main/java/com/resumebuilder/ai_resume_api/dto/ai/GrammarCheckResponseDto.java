package com.resumebuilder.ai_resume_api.dto.ai;

import java.util.List;

public record GrammarCheckResponseDto(
        int issueCount,
        List<GrammarIssueDto> issues) {
}