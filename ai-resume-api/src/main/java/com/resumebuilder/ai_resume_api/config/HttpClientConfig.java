package com.resumebuilder.ai_resume_api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class HttpClientConfig {
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
                .build();
    }
}