package com.resumebuilder.ai_resume_api.enums;

/**
 * Types of usage to track for feature limits
 */
public enum UsageType {
    BULLET_REWRITE, // Bullet point rewriting (per resume)
    ATS_SCORE, // ATS score analysis (per resume)
    TAILORING, // Resume tailoring (per month)
    COVER_LETTER, // Cover letter generation (per resume)
    AI_GENERATION // AI text generation quota (per resume)
}