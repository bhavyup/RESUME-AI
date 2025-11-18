package com.resumebuilder.ai_resume_api.util;

import jakarta.servlet.http.Cookie;

public class CookieUtil {
    private CookieUtil() {
    }

    public static Cookie httpOnlyCookie(String name, String value, int maxAgeSeconds, boolean secure, String sameSite,
            String path) {
        Cookie c = new Cookie(name, value);
        c.setHttpOnly(true);
        c.setSecure(secure);
        c.setPath(path == null ? "/" : path);
        c.setMaxAge(maxAgeSeconds);
        return c;
    }

    public static String buildSetCookieHeader(Cookie c, String sameSite) {
        StringBuilder sb = new StringBuilder();
        sb.append(c.getName()).append("=").append(c.getValue())
                .append("; Path=").append(c.getPath())
                .append("; Max-Age=").append(c.getMaxAge())
                .append("; HttpOnly");
        if (c.getSecure())
            sb.append("; Secure");
        if (sameSite != null)
            sb.append("; SameSite=").append(sameSite);
        return sb.toString();
    }
}