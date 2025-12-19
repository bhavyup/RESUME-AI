/**
 * Feature Flags Configuration
 * 
 * This file manages feature flags for the application.
 * You can enable/disable features by setting the corresponding environment variables.
 */

export const FEATURES = {
  // Stripe payments integration
  STRIPE_ENABLED: !!process.env.STRIPE_SECRET_KEY,
  
  // Client-side Stripe check
  STRIPE_CLIENT_ENABLED: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
} as const;

export function isStripeEnabled(): boolean {
  return FEATURES.STRIPE_ENABLED;
}

export function isStripeClientEnabled(): boolean {
  return FEATURES.STRIPE_CLIENT_ENABLED;
}
