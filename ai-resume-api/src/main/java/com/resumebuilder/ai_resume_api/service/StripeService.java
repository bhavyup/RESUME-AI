package com.resumebuilder.ai_resume_api.service;

import com.resumebuilder.ai_resume_api.dto.CheckoutSessionResponseDto;
import com.resumebuilder.ai_resume_api.entity.PaymentHistoryEntity;
import com.resumebuilder.ai_resume_api.entity.SubscriptionPlanEntity;
import com.resumebuilder.ai_resume_api.entity.UserEntity;
import com.resumebuilder.ai_resume_api.enums.SubscriptionPlanType;
import com.resumebuilder.ai_resume_api.enums.SubscriptionStatus;
import com.resumebuilder.ai_resume_api.exception.BadRequestException;
import com.resumebuilder.ai_resume_api.exception.NotFoundException;
import com.resumebuilder.ai_resume_api.repository.PaymentHistoryRepository;
import com.resumebuilder.ai_resume_api.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service for Stripe payment integration
 */
@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;
    private final PaymentHistoryRepository paymentHistoryRepository;
    private final com.resumebuilder.ai_resume_api.repository.UserSubscriptionRepository userSubscriptionRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${application.frontend.url}")
    private String frontendUrl;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    public StripeService(
            SubscriptionService subscriptionService,
            UserRepository userRepository,
            PaymentHistoryRepository paymentHistoryRepository,
            com.resumebuilder.ai_resume_api.repository.UserSubscriptionRepository userSubscriptionRepository) {
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
        this.paymentHistoryRepository = paymentHistoryRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }

    /**
     * Create Stripe checkout session for PRO plan upgrade
     */
    @Transactional
    public CheckoutSessionResponseDto createCheckoutSession(
            UserEntity user,
            String successUrl,
            String cancelUrl) throws StripeException {

        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new BadRequestException("Stripe is not configured. Please contact support.");
        }

        // Get PRO plan
        SubscriptionPlanEntity proPlan = subscriptionService.getPlanByType(SubscriptionPlanType.PRO);

        if (proPlan.getStripePriceId() == null || proPlan.getStripePriceId().isBlank()) {
            throw new BadRequestException("PRO plan is not configured in Stripe. Please contact support.");
        }

        // Get or create Stripe customer
        String customerId = getOrCreateStripeCustomer(user);

        // Default URLs if not provided
        if (successUrl == null || successUrl.isBlank()) {
            successUrl = frontendUrl + "/subscription?success=true";
        }
        if (cancelUrl == null || cancelUrl.isBlank()) {
            cancelUrl = frontendUrl + "/subscription?canceled=true";
        }

        // Create checkout session
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(proPlan.getStripePriceId())
                                .setQuantity(1L)
                                .build())
                .setSubscriptionData(
                        SessionCreateParams.SubscriptionData.builder()
                                .setTrialPeriodDays(proPlan.getTrialPeriodDays().longValue())
                                .putMetadata("userId", user.getId().toString())
                                .putMetadata("planType", "PRO")
                                .build())
                .putMetadata("userId", user.getId().toString())
                .build();

        Session session = Session.create(params);

        log.info("Created Stripe checkout session {} for user {}", session.getId(), user.getId());

        return new CheckoutSessionResponseDto(session.getId(), session.getUrl());
    }

    /**
     * Create Stripe customer portal session (for managing subscription)
     */
    public String createPortalSession(UserEntity user) throws StripeException {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new BadRequestException("Stripe is not configured. Please contact support.");
        }

        var subscription = subscriptionService.getOrCreateSubscription(user);

        if (subscription.getStripeCustomerId() == null) {
            throw new BadRequestException("No active subscription found");
        }

        var params = com.stripe.param.billingportal.SessionCreateParams.builder()
                .setCustomer(subscription.getStripeCustomerId())
                .setReturnUrl(frontendUrl + "/subscription")
                .build();

        var portalSession = com.stripe.model.billingportal.Session.create(params);

        return portalSession.getUrl();
    }

    /**
     * Get or create Stripe customer for user
     */
    private String getOrCreateStripeCustomer(UserEntity user) throws StripeException {
        var subscription = subscriptionService.getOrCreateSubscription(user);

        // Check if customer already exists
        if (subscription.getStripeCustomerId() != null) {
            try {
                Customer customer = Customer.retrieve(subscription.getStripeCustomerId());
                if (customer != null && !customer.getDeleted()) {
                    return customer.getId();
                }
            } catch (StripeException e) {
                log.warn("Failed to retrieve existing customer {}, creating new one",
                        subscription.getStripeCustomerId());
            }
        }

        // Create new customer
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getFullName())
                .putMetadata("userId", user.getId().toString())
                .build();

        Customer customer = Customer.create(params);

        log.info("Created Stripe customer {} for user {}", customer.getId(), user.getId());

        return customer.getId();
    }

    /**
     * Handle Stripe webhook events
     */
    @Transactional
    public void handleWebhookEvent(Event event) {
        log.info("Processing Stripe webhook event: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(event);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
                handleSubscriptionUpdated(event);
                break;

            case "customer.subscription.deleted":
                handleSubscriptionDeleted(event);
                break;

            case "customer.subscription.trial_will_end":
                handleTrialWillEnd(event);
                break;

            case "invoice.payment_succeeded":
                handlePaymentSucceeded(event);
                break;

            case "invoice.payment_failed":
                handlePaymentFailed(event);
                break;

            default:
                log.debug("Unhandled webhook event type: {}", event.getType());
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
        if (session == null)
            return;

        String userId = session.getMetadata().get("userId");
        if (userId == null) {
            log.warn("No userId in checkout session metadata");
            return;
        }

        UserEntity user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        String subscriptionId = session.getSubscription();
        String customerId = session.getCustomer();

        log.info("Checkout completed for user {}, subscription {}", userId, subscriptionId);

        try {
            // Retrieve subscription details
            Subscription stripeSubscription = Subscription.retrieve(subscriptionId);

            Instant trialEnd = stripeSubscription.getTrialEnd() != null
                    ? Instant.ofEpochSecond(stripeSubscription.getTrialEnd())
                    : null;

            Instant periodStart = Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodStart());
            Instant periodEnd = Instant.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd());

            // Upgrade user to PRO with trial
            subscriptionService.upgradeToProWithTrial(
                    user,
                    customerId,
                    subscriptionId,
                    trialEnd,
                    periodStart,
                    periodEnd);

            log.info("User {} upgraded to PRO (trial until {})", userId, trialEnd);

        } catch (StripeException e) {
            log.error("Failed to retrieve subscription {}", subscriptionId, e);
        }
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null)
            return;

        String subscriptionId = subscription.getId();
        String status = subscription.getStatus();

        Instant periodStart = Instant.ofEpochSecond(subscription.getCurrentPeriodStart());
        Instant periodEnd = Instant.ofEpochSecond(subscription.getCurrentPeriodEnd());

        SubscriptionStatus subscriptionStatus = mapStripeStatus(status);

        log.info("Subscription {} updated to status {}", subscriptionId, status);

        try {
            subscriptionService.updateSubscriptionStatus(
                    subscriptionId,
                    subscriptionStatus,
                    periodStart,
                    periodEnd);
        } catch (NotFoundException e) {
            log.warn("Subscription not found in database: {}", subscriptionId);
        }
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null)
            return;

        String subscriptionId = subscription.getId();
        String userId = subscription.getMetadata().get("userId");

        log.info("Subscription {} deleted for user {}", subscriptionId, userId);

        if (userId != null) {
            subscriptionService.downgradeToFree(Long.parseLong(userId));
        }
    }

    private void handleTrialWillEnd(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null)
            return;

        String userId = subscription.getMetadata().get("userId");
        log.info("Trial will end soon for user {}", userId);

        // TODO: Send email notification to user
    }

    private void handlePaymentSucceeded(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null)
            return;

        String customerId = invoice.getCustomer();
        String subscriptionId = invoice.getSubscription();

        log.info("Payment succeeded for subscription {}", subscriptionId);

        // Record payment in history
        try {
            var subscription = subscriptionService.getOrCreateSubscription(
                    getUserByStripeCustomerId(customerId));

            PaymentHistoryEntity payment = new PaymentHistoryEntity();
            payment.setUser(subscription.getUser());
            payment.setSubscription(subscription);
            payment.setStripePaymentIntentId(invoice.getPaymentIntent());
            payment.setStripeInvoiceId(invoice.getId());
            payment.setStripeChargeId(invoice.getCharge());
            payment.setAmountCents(invoice.getAmountPaid().intValue());
            payment.setCurrency(invoice.getCurrency().toUpperCase());
            payment.setStatus("SUCCEEDED");
            payment.setReceiptUrl(invoice.getHostedInvoiceUrl());
            payment.setInvoicePdf(invoice.getInvoicePdf());
            payment.setPaymentDate(Instant.ofEpochSecond(invoice.getStatusTransitions().getPaidAt()));

            paymentHistoryRepository.save(payment);

            log.info("Recorded payment for user {}", subscription.getUser().getId());

        } catch (Exception e) {
            log.error("Failed to record payment for invoice {}", invoice.getId(), e);
        }
    }

    private void handlePaymentFailed(Event event) {
        Invoice invoice = (Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null)
            return;

        @SuppressWarnings("unused")
        String customerId = invoice.getCustomer();
        String subscriptionId = invoice.getSubscription();

        log.warn("Payment failed for subscription {}", subscriptionId);

        // Update subscription status to PAST_DUE
        try {
            subscriptionService.updateSubscriptionStatus(
                    subscriptionId,
                    SubscriptionStatus.PAST_DUE,
                    Instant.ofEpochSecond(invoice.getPeriodStart()),
                    Instant.ofEpochSecond(invoice.getPeriodEnd()));
        } catch (Exception e) {
            log.error("Failed to update subscription status", e);
        }

        // TODO: Send email notification to user
    }

    private UserEntity getUserByStripeCustomerId(String customerId) {
        var subscription = userSubscriptionRepository.findByStripeCustomerId(customerId)
                .orElseThrow(() -> new NotFoundException("No subscription found for customer: " + customerId));
        return subscription.getUser();
    }

    private SubscriptionStatus mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus.toLowerCase()) {
            case "active" -> SubscriptionStatus.ACTIVE;
            case "trialing" -> SubscriptionStatus.TRIALING;
            case "past_due" -> SubscriptionStatus.PAST_DUE;
            case "canceled" -> SubscriptionStatus.CANCELED;
            case "unpaid" -> SubscriptionStatus.UNPAID;
            case "incomplete" -> SubscriptionStatus.INCOMPLETE;
            case "incomplete_expired" -> SubscriptionStatus.INCOMPLETE_EXPIRED;
            default -> SubscriptionStatus.ACTIVE;
        };
    }

    // Make subscriptionRepository accessible to this method
    public void setSubscriptionRepository(com.resumebuilder.ai_resume_api.repository.UserSubscriptionRepository repo) {
        // Workaround for accessing repository
    }
}