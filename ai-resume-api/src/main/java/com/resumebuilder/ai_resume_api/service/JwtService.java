package com.resumebuilder.ai_resume_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final byte[] secret;
    private final long expirationSeconds;
    private final String issuer;

    public JwtService(
            @Value("${application.jwt.secret-base64}") String secretBase64,
            @Value("${application.jwt.expiration-seconds:3600}") long expirationSeconds,
            @Value("${application.jwt.issuer:ai-resume-api}") String issuer) {
        this.secret = io.jsonwebtoken.io.Decoders.BASE64.decode(secretBase64);
        if (this.secret.length < 32)
            throw new IllegalArgumentException("JWT secret must be at least 256 bits (32 bytes)");
        this.expirationSeconds = expirationSeconds;
        this.issuer = issuer;
    }

    public String generateAccessToken(Long userId, String username,
            java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        var now = java.time.Instant.now();
        var exp = now.plusSeconds(expirationSeconds);
        var key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(secret);
        var roles = authorities == null ? java.util.List.<String>of()
                : authorities.stream().map(org.springframework.security.core.GrantedAuthority::getAuthority).toList();
        return io.jsonwebtoken.Jwts.builder()
                .setId(java.util.UUID.randomUUID().toString())
                .setSubject(String.valueOf(userId))
                .setIssuer(issuer)
                .setAudience("web")
                .claim("username", username)
                .claim("roles", roles)
                .claim("typ", "access")
                .setIssuedAt(java.util.Date.from(now))
                .setExpiration(java.util.Date.from(exp))
                .signWith(key, io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }

    public io.jsonwebtoken.Claims parse(String token) {
        return io.jsonwebtoken.Jwts.parserBuilder()
                .setAllowedClockSkewSeconds(30)
                .requireIssuer(issuer)
                .setSigningKey(io.jsonwebtoken.security.Keys.hmacShaKeyFor(secret))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return (String) parse(token).get("username");
    }

    public String extractSubject(String token) {
        return parse(token).getSubject();
    }

    public boolean isTokenValid(String token, String expectedUsername) {
        try {
            var claims = parse(token);
            String username = (String) claims.get("username");
            java.util.Date exp = claims.getExpiration();
            return expectedUsername.equals(username) && exp.after(new java.util.Date());
        } catch (io.jsonwebtoken.JwtException ex) {
            return false;
        }
    }

    public long getExpiresInSeconds() {
        return expirationSeconds;
    }

    public String extractJti(String token) {
        return parse(token).getId();
    }

    public java.time.Instant extractExpiration(String token) {
        return parse(token).getExpiration().toInstant();
    }
}