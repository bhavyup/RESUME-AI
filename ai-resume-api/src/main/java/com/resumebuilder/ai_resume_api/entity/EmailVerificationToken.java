package com.resumebuilder.ai_resume_api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "email_verification_tokens", indexes = {
        @Index(name = "idx_evt_user", columnList = "user_id"),
        @Index(name = "idx_evt_expires", columnList = "expires_at")
})
public class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private java.time.Instant expiresAt;

    @Column(name = "consumed_at")
    private java.time.Instant consumedAt;

    // getters/setters...
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public java.time.Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(java.time.Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public java.time.Instant getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(java.time.Instant consumedAt) {
        this.consumedAt = consumedAt;
    }
}