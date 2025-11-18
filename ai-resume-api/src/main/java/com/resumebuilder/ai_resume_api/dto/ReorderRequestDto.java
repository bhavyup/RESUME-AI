package com.resumebuilder.ai_resume_api.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ReorderRequestDto(
        @NotNull Long resumeVersion,
        @NotEmpty List<Long> orderedIds) {
}