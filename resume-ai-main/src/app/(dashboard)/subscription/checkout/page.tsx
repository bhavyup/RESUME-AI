import { CheckoutForm } from "@/components/checkout-form"
import { ArrowLeft, Shield, Lock } from "lucide-react"
import Link from "next/link"

const CheckoutPage = () => {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 pb-32">
                {/* Back Link */}
                <Link 
                    href="/subscription" 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to plans</span>
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Complete Your Purchase</h1>
                    <p className="text-slate-400">You&apos;re just one step away from unlocking Pro features</p>
                </div>

                {/* Security Badges */}
                <div className="flex items-center justify-center gap-6 mb-8 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span>256-bit SSL encryption</span>
                    </div>
                </div>

                {/* Checkout Form Container */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
                    <CheckoutForm />
                </div>

                {/* Trust Footer */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    <p>Powered by Stripe • PCI DSS Compliant • Cancel anytime</p>
                </div>
            </div>
        </main>
    )
}

export default CheckoutPage