package com.resumebuilder.ai_resume_api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Scheduled tasks for subscription management
 */
@Service
public class SubscriptionSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionSchedulerService.class);

    private final SubscriptionService subscriptionService;

    public SubscriptionSchedulerService(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /**
     * Process expired trials every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at :00
    public void processExpiredTrials() {
        log.info("Running scheduled task: process expired trials");
        try {
            subscriptionService.processExpiredTrials();
        } catch (Exception e) {
            log.error("Error processing expired trials", e);
        }
    }

    /**
     * Process pending cancellations every hour
     */
    @Scheduled(cron = "0 15 * * * *") // Every hour at :15
    public void processPendingCancellations() {
        log.info("Running scheduled task: process pending cancellations");
        try {
            subscriptionService.processPendingCancellations();
        } catch (Exception e) {
            log.error("Error processing pending cancellations", e);
        }
    }

    /**
     * Log subscription statistics daily
     */
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2 AM
    public void logSubscriptionStats() {
        log.info("Running scheduled task: log subscription statistics");
        try {
            // Call a public method instead of accessing private repository
            long proCount = subscriptionService.countActiveProSubscriptions();
            log.info("Active PRO subscriptions: {}", proCount);
        } catch (Exception e) {
            log.error("Error logging subscription stats", e);
        }
    }
}