package com.resumebuilder.ai_resume_api.util;

public class JsonRepairUtil {

    public static String tryRepair(String s) {
        if (s == null) return null;
        String t = s.trim();

        // Strip common code fences
        t = t.replaceAll("(?s)```json\\s*", "")
             .replaceAll("(?s)```", "");

        // Normalize smart quotes to regular quotes
        t = t.replace('“','"').replace('”','"').replace('’','\'');

        // Clip to first balanced {...}
        String clipped = clipToBalancedObject(t);
        if (clipped != null) t = clipped;

        // Remove trailing commas before } or ]
        t = t.replaceAll(",\\s*([}\\]])", "$1");

        return t.trim();
    }

    private static String clipToBalancedObject(String s) {
        int start = s.indexOf('{');
        if (start < 0)
            return null;
        int depth = 0;
        for (int i = start; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '{')
                depth++;
            else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return s.substring(start, i + 1);
                }
            }
        }
        // no full closure found
        return null;
    }
}