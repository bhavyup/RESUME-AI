package com.resumebuilder.ai_resume_api.util;

import java.text.Normalizer;

public final class Normalization {
    private Normalization() {
    }

    public static String username(String raw) {
        if (raw == null)
            return null;
        return Normalizer.normalize(raw, Normalizer.Form.NFKC).trim().toLowerCase();
    }

    public static String email(String raw) {
        if (raw == null)
            return null;
        return raw.trim().toLowerCase();
    }

    public static String name(String raw) {
        if (raw == null)
            return null;
        return Normalizer.normalize(raw, Normalizer.Form.NFKC).trim();
    }
}