package com.resumebuilder.ai_resume_api.dto.resume;

import java.time.LocalDate;
import java.util.List;

public record PatentResponseDto(
        Long id,
        Long version,

        String title,

        String patentNumber,
        String applicationNumber,
        String priorityNumber,
        String pctNumber,

        LocalDate filingDate,
        LocalDate grantDate,
        LocalDate publicationDate,

        String status,
        String office,
        String jurisdictionCountry,

        String kindCode,
        String familyId,

        String shortDescription,
        String claimsSummary,

        String officialUrl,

        List<String> inventors,
        List<String> assignees,

        List<String> ipcClasses,
        List<String> cpcClasses,

        List<PatentLinkDto> links) {
}