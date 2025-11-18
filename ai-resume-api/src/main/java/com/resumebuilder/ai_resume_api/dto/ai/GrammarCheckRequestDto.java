package com.resumebuilder.ai_resume_api.dto.ai;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator.Mode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Check grammar/tense for a text snippet")
public record GrammarCheckRequestDto(
        @NotBlank @Size(max = 10000) String text,
        String language) {
    // Support JSON body as a plain string: "your text here"
    @JsonCreator(mode = Mode.DELEGATING)
    public static GrammarCheckRequestDto fromString(String text) {
        return new GrammarCheckRequestDto(text, null);
    }

    // Ensure canonical constructor still works for normal JSON objects
    public GrammarCheckRequestDto(@JsonProperty("text") String text,
            @JsonProperty("language") String language) {
        this.text = text;
        this.language = language;
    }
}