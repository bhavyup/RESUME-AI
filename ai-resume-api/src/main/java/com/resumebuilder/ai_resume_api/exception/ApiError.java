package com.resumebuilder.ai_resume_api.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        String traceId, // from X-Correlation-Id
        String exception, // ex.getClass().getName()
        String rootCause, // root cause message
        Map<String, Object> details // arbitrary structured details (field errors, sqlState, etc.)
) {
}