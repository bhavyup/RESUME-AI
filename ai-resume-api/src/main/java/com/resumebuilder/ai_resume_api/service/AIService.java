package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.OllamaRequestDto;
import com.resumebuilder.ai_resume_api.dto.OllamaResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String model;

    public AIService(RestTemplate restTemplate,
            @Value("${ai.ollama.url:http://localhost:11434/api/generate}") String apiUrl,
            @Value("${ai.ollama.model:qwen2.5-coder:3b}") String model) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.model = model;
    }

    public String getSuggestions(String jobTitle, String descriptionDraft) {
        if (jobTitle == null || jobTitle.isBlank()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Job title is required for AI suggestions.");
        }
        if (descriptionDraft == null || descriptionDraft.isBlank()) {
            throw new com.resumebuilder.ai_resume_api.exception.BadRequestException(
                    "Description draft is required for AI suggestions.");
        }

        String prompt = String.format(
                "You are an expert resume writer. Given the job title and draft, " +
                        "rewrite into exactly 3 professional, action-oriented STAR bullet points. Output only bullets.\n"
                        +
                        "Job Title: %s\nDraft: \"%s\"",
                jobTitle.trim(), descriptionDraft.trim());

        var requestDto = new OllamaRequestDto(model, prompt, false);
        var headers = new org.springframework.http.HttpHeaders();
        headers.set(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/json");
        var requestEntity = new org.springframework.http.HttpEntity<>(requestDto, headers);

        try {
            log.debug("Calling Ollama at {} with model {}", apiUrl, model);
            var response = restTemplate.postForObject(apiUrl, requestEntity, OllamaResponseDto.class);
            if (response == null) {
                log.warn("AI response is null from {}", apiUrl);
                return "AI model returned an empty response.";
            }
            var text = response.response();
            return (text != null && !text.isBlank()) ? text.trim() : "AI model returned an empty response.";
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Timeout or connection error calling Ollama: {}", e.getMessage());
            throw new RuntimeException("AI service is unavailable. Please try again later.", e);
        } catch (Exception e) {
            log.error("Error calling Ollama", e);
            throw new RuntimeException("Error communicating with the local AI model.", e);
        }
    }
}