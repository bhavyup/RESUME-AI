package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Stripe checkout session response")
public record CheckoutSessionResponseDto(
        String sessionId,
        String url // Redirect user to this URL
) {
}