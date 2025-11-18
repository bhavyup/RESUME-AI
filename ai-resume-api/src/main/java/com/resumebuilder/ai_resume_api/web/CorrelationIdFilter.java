package com.resumebuilder.ai_resume_api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class CorrelationIdFilter implements Filter {
    private static final String HEADER = "X-Correlation-Id";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        var request = (HttpServletRequest) req;
        var response = (HttpServletResponse) res;
        String cid = request.getHeader(HEADER);
        if (cid == null || cid.isBlank())
            cid = UUID.randomUUID().toString();
        MDC.put(HEADER, cid);
        response.setHeader(HEADER, cid);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.remove(HEADER);
        }
    }
}