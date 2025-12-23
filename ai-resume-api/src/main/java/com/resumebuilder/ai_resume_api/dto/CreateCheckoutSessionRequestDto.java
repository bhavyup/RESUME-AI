package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request to create Stripe checkout session")
public record CreateCheckoutSessionRequestDto(
        @NotBlank String planType, // "FREE" or "PRO"
        String successUrl,
        String cancelUrl) {
}