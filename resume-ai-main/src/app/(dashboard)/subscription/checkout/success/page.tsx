// /src/app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, ArrowRight, FileText, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const SuccessPage = () => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Trigger confetti celebration
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
        setShowContent(true);
    }, []);

    const nextSteps = [
        {
            icon: FileText,
            title: 'Create a Base Resume',
            description: 'Build your master resume with all your experience',
            href: '/resumes'
        },
        {
            icon: Target,
            title: 'Tailor for Jobs',
            description: 'AI-customize your resume for specific positions',
            href: '/resumes'
        },
        {
            icon: Zap,
            title: 'Explore AI Models',
            description: 'Access GPT-5, Claude Opus, and more in Settings',
            href: '/settings'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 max-w-2xl w-full"
            >
                {/* Success Card */}
                <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 shadow-2xl">
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="relative inline-flex mb-6"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <Check className="w-12 h-12 text-white" strokeWidth={3} />
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                        >
                            <Crown className="w-5 h-5 text-white" />
                        </motion.div>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Welcome to Pro!
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg mb-6">
                            Your subscription is now active. Time to supercharge your job search!
                        </p>
                    </motion.div>

                    {/* Pro Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Pro Member Activated</span>
                    </motion.div>

                    {/* Features Unlocked */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid gap-3 mb-8"
                    >
                        {[
                            'Unlimited AI-tailored resumes',
                            'Access to all premium AI models',
                            'Priority support & processing'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-slate-300 text-sm">{feature}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link href="/home">
                            <Button className="w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25">
                                <span>Go to Dashboard</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Next Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8"
                >
                    <h2 className="text-lg font-semibold text-white text-center mb-4">What&apos;s Next?</h2>
                    <div className="grid gap-4">
                        {nextSteps.map((step, i) => (
                            <Link key={i} href={step.href}>
                                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900/80 hover:border-slate-700 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                                            <step.icon className="w-6 h-6 text-teal-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{step.title}</p>
                                            <p className="text-sm text-slate-500">{step.description}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div><div className="bg-transparent h-32 w-full"></div>
            </motion.div>
            
        </div>
    )
}

export default SuccessPage
