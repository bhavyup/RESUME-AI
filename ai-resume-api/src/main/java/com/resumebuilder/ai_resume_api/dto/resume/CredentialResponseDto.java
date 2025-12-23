package com.resumebuilder.ai_resume_api.dto.resume;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CredentialResponseDto(
        Long id,
        Long version,

        String name,
        String type,
        String issuer,
        String issuerUrl,

        LocalDate issueDate,
        LocalDate expiryDate,
        boolean doesNotExpire,

        String status,

        String credentialId,
        String credentialUrl,

        BigDecimal score,
        String scoreUnit,
        String level,

        String description,
        String badgeImageUrl,

        List<String> keywords) {
}