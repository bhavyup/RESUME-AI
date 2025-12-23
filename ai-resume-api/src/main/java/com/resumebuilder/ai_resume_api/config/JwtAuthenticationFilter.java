package com.resumebuilder.ai_resume_api.config;

import com.resumebuilder.ai_resume_api.service.JwtService;
import com.resumebuilder.ai_resume_api.security.AccessTokenBlocklist;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AccessTokenBlocklist blocklist;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService,
            AccessTokenBlocklist blocklist) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.blocklist = blocklist;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        try {
            String jti = jwtService.extractJti(token);
            if (jti != null && blocklist.isRevoked(jti)) {
                request.setAttribute("auth.error", "TOKEN_REVOKED");
                filterChain.doFilter(request, response);
                return;
            }
            String username = jwtService.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(token, userDetails.getUsername())) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (io.jsonwebtoken.JwtException e) {
            // Let the entry point generate a 401 JSON
        }
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String p = request.getRequestURI();
        return p.startsWith("/api/auth/")
                || p.startsWith("/actuator/")
                || p.startsWith("/v3/api-docs")
                || p.equals("/swagger-ui.html")
                || p.startsWith("/swagger-ui");
    }
}