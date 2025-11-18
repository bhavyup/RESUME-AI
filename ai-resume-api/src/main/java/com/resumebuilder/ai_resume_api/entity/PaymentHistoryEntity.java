package com.resumebuilder.ai_resume_api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payment_history", indexes = {
        @Index(name = "idx_ph_user", columnList = "user_id"),
        @Index(name = "idx_ph_subscription", columnList = "subscription_id"),
        @Index(name = "idx_ph_stripe_payment", columnList = "stripe_payment_intent_id"),
        @Index(name = "idx_ph_status", columnList = "status"),
        @Index(name = "idx_ph_date", columnList = "payment_date")
})
public class PaymentHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private UserSubscriptionEntity subscription;

    // Stripe data
    @Size(max = 128)
    @Column(name = "stripe_payment_intent_id", unique = true, length = 128)
    private String stripePaymentIntentId;

    @Size(max = 128)
    @Column(name = "stripe_invoice_id", length = 128)
    private String stripeInvoiceId;

    @Size(max = 128)
    @Column(name = "stripe_charge_id", length = 128)
    private String stripeChargeId;

    // Payment details
    @NotNull
    @Min(0)
    @Column(name = "amount_cents", nullable = false)
    private Integer amountCents;

    @NotBlank
    @Size(max = 3)
    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @NotBlank
    @Size(max = 32)
    @Column(nullable = false, length = 32)
    private String status; // SUCCEEDED, FAILED, PENDING, REFUNDED

    // Receipt
    @Column(name = "receipt_url", columnDefinition = "TEXT")
    private String receiptUrl;

    @Column(name = "invoice_pdf", columnDefinition = "TEXT")
    private String invoicePdf;

    // Timestamps
    @NotNull
    @Column(name = "payment_date", nullable = false)
    private Instant paymentDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (paymentDate == null) {
            paymentDate = Instant.now();
        }
    }
}