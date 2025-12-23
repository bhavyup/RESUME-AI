package com.resumebuilder.ai_resume_api.entity;

import com.resumebuilder.ai_resume_api.enums.UsageType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usage_tracking", indexes = {
        @Index(name = "idx_ut_user_type_period", columnList = "user_id, usage_type, billing_period_start, billing_period_end"),
        @Index(name = "idx_ut_user_period", columnList = "user_id, billing_period_start"),
        @Index(name = "idx_ut_created", columnList = "created_at")
})
public class UsageTrackingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "usage_type", nullable = false, length = 32)
    private UsageType usageType;

    // Resource reference (optional)
    @Size(max = 32)
    @Column(name = "resource_type", length = 32)
    private String resourceType;

    @Column(name = "resource_id")
    private Long resourceId;

    // Billing period tracking
    @NotNull
    @Column(name = "billing_period_start", nullable = false)
    private Instant billingPeriodStart;

    @NotNull
    @Column(name = "billing_period_end", nullable = false)
    private Instant billingPeriodEnd;

    // Metadata (JSONB in PostgreSQL)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}