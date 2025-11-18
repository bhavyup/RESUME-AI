package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.dto.*;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.resumebuilder.ai_resume_api.security.SecurityUtil;
import com.resumebuilder.ai_resume_api.service.StripeService;
import com.resumebuilder.ai_resume_api.service.SubscriptionService;
import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Subscription", description = "Subscription and billing management")
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final StripeService stripeService;
    private final UserRepository userRepository;

    public SubscriptionController(
            SubscriptionService subscriptionService,
            StripeService stripeService,
            UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
        this.stripeService = stripeService;
        this.userRepository = userRepository;
    }

    @GetMapping("/status")
    @Operation(summary = "Get current user's subscription status")
    public ResponseEntity<SubscriptionStatusDto> getSubscriptionStatus() {
        return ResponseEntity.ok(subscriptionService.getCurrentSubscriptionStatus());
    }

    @GetMapping("/plans")
    @Operation(summary = "Get all available subscription plans")
    public ResponseEntity<List<SubscriptionPlanDto>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getAvailablePlans());
    }

    @PostMapping("/checkout")
    @Operation(summary = "Create Stripe checkout session to upgrade to PRO")
    public ResponseEntity<CheckoutSessionResponseDto> createCheckoutSession(
            @Valid @RequestBody CreateCheckoutSessionRequestDto request) throws StripeException {

        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        var response = stripeService.createCheckoutSession(
                user,
                request.successUrl(),
                request.cancelUrl());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/portal")
    @Operation(summary = "Create Stripe customer portal session")
    public ResponseEntity<CheckoutSessionResponseDto> createPortalSession() throws StripeException {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        String url = stripeService.createPortalSession(user);

        return ResponseEntity.ok(new CheckoutSessionResponseDto(null, url));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancel subscription (will downgrade at period end)")
    public ResponseEntity<UserSubscriptionDto> cancelSubscription() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        var subscription = subscriptionService.cancelSubscription(user.getId());

        return ResponseEntity.ok(toDto(subscription));
    }

    @GetMapping("/status/flat")
    @Operation(summary = "Get subscription status in flat structure (frontend-compatible)")
    public ResponseEntity<SubscriptionStatusFlatDto> getSubscriptionStatusFlat() {
        String username = SecurityUtil.currentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.resumebuilder.ai_resume_api.exception.NotFoundException("User not found"));

        var statusDto = subscriptionService.getCurrentSubscriptionStatusFlat(user);
        return ResponseEntity.ok(statusDto);
    }

    private UserSubscriptionDto toDto(com.resumebuilder.ai_resume_api.entity.UserSubscriptionEntity entity) {
        // Simplified conversion - you can extract this to a mapper
        return new UserSubscriptionDto(
                entity.getId(),
                null, // Plan DTO would be populated by full mapper
                entity.getStatus().name(),
                entity.getCurrentPeriodStart(),
                entity.getCurrentPeriodEnd(),
                entity.getTrialEnd(),
                entity.getCancelAtPeriodEnd(),
                entity.getCanceledAt(),
                entity.isActive(),
                entity.isTrialing(),
                entity.isPro(),
                null,
                null);
    }
}