package com.resumebuilder.ai_resume_api.dto.resume;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AwardResponseDto(
        Long id,
        Long version,

        String title,
        String issuer,
        String issuerUrl,

        LocalDate dateReceived,
        String description,

        BigDecimal monetaryAmountUsd,
        String currencyCode,
        String awardType,

        String linkTitle,
        String linkUrl) {
}