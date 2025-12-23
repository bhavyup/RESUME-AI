// in dto/HuggingFaceResponseDto.java
package com.resumebuilder.ai_resume_api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record HuggingFaceResponseDto(
    @JsonProperty("generated_text") String generatedText
) {}