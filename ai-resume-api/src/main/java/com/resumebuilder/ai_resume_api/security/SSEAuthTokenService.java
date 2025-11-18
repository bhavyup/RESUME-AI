package com.resumebuilder.ai_resume_api.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class SSEAuthTokenService {

    private final byte[] secret;

    public SSEAuthTokenService(
            @Value("${application.jwt.secret-base64}") String base64Secret) {
        this.secret = Base64.getDecoder().decode(base64Secret);
    }

    public String issue(String username, Long resumeId, long ttlSeconds) {
        long exp = Instant.now().getEpochSecond() + ttlSeconds;
        String payload = "u=" + safe(username) + ";r=" + resumeId + ";exp=" + exp;
        String sig = sign(payload);
        return base64Url(payload) + "." + sig;
    }

    public boolean validate(String token, String expectedUser, Long expectedResumeId) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2)
                return false;
            String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
            String sig = parts[1];

            if (!sign(payload).equals(sig))
                return false;

            String username = extract(payload, "u");
            Long resumeId = Long.valueOf(extract(payload, "r"));
            long exp = Long.parseLong(extract(payload, "exp"));
            if (Instant.now().getEpochSecond() > exp)
                return false;

            if (expectedUser != null && !expectedUser.equals(username))
                return false;
            if (expectedResumeId != null && !expectedResumeId.equals(resumeId))
                return false;

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String extract(String payload, String key) {
        for (String part : payload.split(";")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key))
                return kv[1];
        }
        return null;
    }

    private String base64Url(String s) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] sig = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(sig);
        } catch (Exception e) {
            throw new IllegalStateException("SSE token signing failed", e);
        }
    }

    private String safe(String v) {
        return v == null ? "" : v.replace(";", "").replace("=", "");
    }
}