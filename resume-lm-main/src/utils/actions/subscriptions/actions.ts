"use server";

import { subscriptionApi } from "@/lib/api";

export async function getSubscriptionStatus() {
  try {
    const status = await subscriptionApi.getSubscriptionStatus();
    return status;
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    // Return free plan as fallback
    return {
      subscription_plan: "free",
      subscription_status: "active",
      current_period_end: null,
      trial_end: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      base_resumes_count: 0,
      tailored_resumes_count: 0,
      can_create_base: true,
      can_create_tailored: true,
      max_base_resumes: 3,
      max_tailored_resumes: 5,
    };
  }
}

export async function createCheckoutSession(planType: string = "PRO") {
  try {
    const result = await subscriptionApi.createCheckoutSession({ planType });
    return result;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function cancelSubscription() {
  try {
    await subscriptionApi.cancelSubscription();
    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}
