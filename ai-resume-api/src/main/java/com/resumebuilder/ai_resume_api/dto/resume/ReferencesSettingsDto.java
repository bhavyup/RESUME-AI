package com.resumebuilder.ai_resume_api.dto.resume;

import jakarta.validation.constraints.NotNull;

public record ReferencesSettingsDto(
        @NotNull Long resumeVersion,
        @NotNull Boolean referencesOnRequest) {
}