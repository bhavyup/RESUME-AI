# Stripe Integration - Disabled

## Current Status
✅ Stripe integration is **DISABLED**

The application has been configured to run without Stripe payment processing.

## What Was Changed

1. **Feature Flag System** (`src/lib/feature-flags.ts`)
   - Created a centralized feature flag system
   - Stripe is disabled when environment variables are not set

2. **Stripe Actions** (`src/utils/actions/stripe/actions.ts`)
   - Modified to check if Stripe is enabled before initialization
   - Added `ensureStripeEnabled()` guard function
   - All Stripe API calls now use the guard to prevent errors

3. **Environment Variables** (`.env.local`)
   - All Stripe keys are commented out
   - Application will run without Stripe functionality

## How to Enable Stripe Later

When you're ready to enable Stripe payments:

1. **Get your Stripe API keys** from https://dashboard.stripe.com/test/apikeys

2. **Update `.env.local`** - Uncomment and set these values:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
   STRIPE_SECRET_KEY="sk_test_your_key_here"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

## What Happens When Stripe is Disabled

- Subscription/payment features will show an error or be hidden
- The app will continue to work for all non-payment features
- Any attempt to use Stripe functionality will throw a clear error message:
  > "Stripe is not enabled. Please set STRIPE_SECRET_KEY in your environment variables."

## Testing

The application should now start without the Stripe error. Features that depend on Stripe will gracefully fail with helpful error messages if accessed.
