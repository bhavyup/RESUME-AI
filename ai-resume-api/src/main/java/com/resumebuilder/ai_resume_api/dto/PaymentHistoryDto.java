package com.resumebuilder.ai_resume_api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Payment history record")
public record PaymentHistoryDto(
        Long id,
        Integer amountCents,
        String currency,
        String status,
        Instant paymentDate,
        String receiptUrl,
        String invoicePdf,
        String amountDisplay // e.g., "$15.00"
) {
}