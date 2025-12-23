package com.resumebuilder.ai_resume_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class AiResumeApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(AiResumeApiApplication.class, args);
	}

	@PostConstruct
	public void init() {
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
	}
}
