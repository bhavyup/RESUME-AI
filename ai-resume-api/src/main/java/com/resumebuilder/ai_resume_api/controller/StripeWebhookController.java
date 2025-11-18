package com.resumebuilder.ai_resume_api.controller;

import com.resumebuilder.ai_resume_api.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.Hidden;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Hidden // Hide from Swagger docs
@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final StripeService stripeService;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    public StripeWebhookController(StripeService stripeService) {
        this.stripeService = stripeService;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Stripe webhook secret not configured, skipping signature verification");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Webhook not configured");
        }

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid webhook signature", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid signature");
        } catch (Exception e) {
            log.error("Error parsing webhook", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid payload");
        }

        // Handle the event
        try {
            stripeService.handleWebhookEvent(event);
            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Error processing webhook event", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing webhook");
        }
    }
}