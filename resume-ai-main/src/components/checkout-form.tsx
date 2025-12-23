'use client'

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from "lucide-react";

import { postStripeSession } from "@/app/(dashboard)/subscription/stripe-session";

export function CheckoutForm() {
    const searchParams = useSearchParams()
    const priceId = searchParams.get('price_id')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!priceId) {
            setError('No price ID provided. Please go back and try again.')
            return
        }

        const initiateCheckout = async () => {
            try {
                const stripeResponse = await postStripeSession({ priceId });
                if (stripeResponse.url) {
                    window.location.href = stripeResponse.url;
                } else {
                    setError('Failed to initialize checkout')
                }
            } catch (err) {
                console.error('Error initiating checkout:', err)
                setError(err instanceof Error ? err.message : 'Failed to initialize checkout')
            }
        }

        initiateCheckout()
    }, [priceId])

    // Show error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Checkout Error</h3>
                <p className="text-slate-400 mb-4">{error}</p>
                <p className="text-sm text-slate-500">
                    Please check your environment variables and try again.
                </p>
            </div>
        )
    }

    // Show loading state
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mb-4" />
            <p className="text-slate-400">Redirecting to secure checkout...</p>
        </div>
    );
}