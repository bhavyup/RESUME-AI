"use server";

import { Stripe } from "stripe";
import { checkAuth } from "@/app/auth/login/actions";
import { createOrRetrieveCustomer } from "@/utils/actions/stripe/actions";

const apiKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(apiKey);

interface NewSessionOptions {
    priceId: string;
}

// Function to create a Stripe Checkout Session (Redirect Mode)
export const postStripeSession = async ({ priceId }: NewSessionOptions) => {
    // Check if user is authenticated
    const { authenticated, user } = await checkAuth();
    
    if (!authenticated || !user?.id || !user?.email) {
        throw new Error('User must be authenticated to create a checkout session');
    }

    try {
        // Get or create Stripe customer
        const customerId = await createOrRetrieveCustomer({
            uuid: user.id,
            email: user.email
        });

        const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/subscription/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`;

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            allow_promotion_codes: true,
            success_url: successUrl,
            cancel_url: cancelUrl,
            billing_address_collection: 'auto',
            payment_method_types: ['card'],
        });

        if (!session.url) {
            throw new Error('Failed to create Stripe session');
        }

        return {
            url: session.url
        };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create checkout session');
    }
}

// Function to create a Stripe Portal Session
export const createPortalSession = async () => {
    'use server';
    
    // Check if user is authenticated
    const { authenticated, user } = await checkAuth();
    
    if (!authenticated || !user?.id || !user?.email) {
        throw new Error('User must be authenticated to access the billing portal');
    }

    try {
        // Get or create Stripe customer
        const customerId = await createOrRetrieveCustomer({
            uuid: user.id,
            email: user.email
        });

        const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/subscription`;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return {
            url: portalSession.url
        };
    } catch (error) {
        console.error('Error creating portal session:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create portal session');
    }
}
