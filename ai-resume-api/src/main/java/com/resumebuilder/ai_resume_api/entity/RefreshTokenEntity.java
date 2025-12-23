package com.resumebuilder.ai_resume_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_rt_user", columnList = "user_id"),
        @Index(name = "idx_rt_expires", columnList = "expires_at")
})
@EntityListeners(AuditingEntityListener.class)
public class RefreshTokenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="token_hash", nullable = false, length = 64) 
    @JsonIgnore // sha-256 hex
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="user_id", nullable = false)
    private UserEntity user;

    @Column(name="issued_at", nullable = false)
    @org.springframework.data.annotation.CreatedDate
    private java.time.Instant issuedAt;

    @Column(name="expires_at", nullable = false)
    private java.time.Instant expiresAt;

    @Column(name="revoked_at")
    private java.time.Instant revokedAt;

    @Column(name="replaced_by_id")
    private Long replacedById;

    @Column(name="ip_address", length = 64)
    private String ipAddress;

    @Column(name="user_agent", length = 512)
    private String userAgent;

    // getters/setters ...
}