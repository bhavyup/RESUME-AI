package com.resumebuilder.ai_resume_api.exception;

import java.io.IOException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        String code = (String) request.getAttribute("auth.error");
        String message = "Authentication required";
        if ("TOKEN_REVOKED".equals(code)) {
            message = "Access token revoked. Please login again.";
        }
        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + message + "\",\"code\":\""
                + (code == null ? "AUTHENTICATION_REQUIRED" : code) + "\"}");
    }
}
