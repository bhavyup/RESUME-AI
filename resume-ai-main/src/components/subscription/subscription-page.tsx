'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Crown,
  Sparkles,
  Zap,
  FileText,
  Target,
  Brain,
  Palette,
  Headphones,
  ArrowRight,
  Clock,
  Shield,
  Star,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { createPortalSession, postStripeSession } from '@/app/(dashboard)/subscription/stripe-session';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

interface SubscriptionPageProps {
  initialProfile: Profile | null;
}

const features = [
  {
    icon: FileText,
    title: 'Unlimited Base Resumes',
    description: 'Create as many master resumes as you need',
    free: '3 resumes',
    pro: 'Unlimited'
  },
  {
    icon: Target,
    title: 'AI-Tailored Resumes',
    description: 'Auto-customize for each job application',
    free: '5 per month',
    pro: 'Unlimited'
  },
  {
    icon: Brain,
    title: 'Advanced AI Models',
    description: 'Access GPT-5, Claude Opus, Gemini Pro',
    free: 'Basic only',
    pro: 'All models'
  },
  {
    icon: Palette,
    title: 'Premium Templates',
    description: 'ATS-optimized professional designs',
    free: '2 templates',
    pro: 'All templates'
  },
  {
    icon: Zap,
    title: 'Priority Processing',
    description: 'Faster AI generation & exports',
    free: 'Standard',
    pro: 'Priority'
  },
  {
    icon: Headphones,
    title: 'Support',
    description: 'Get help when you need it',
    free: 'Community',
    pro: 'Priority 24/7'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content: 'ResumeAI helped me land 3 interviews in my first week. The AI suggestions were incredibly accurate.',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager at Meta',
    content: 'Went from 2% to 15% response rate. This tool paid for itself with my first interview.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist at Microsoft',
    content: 'The tailored resumes feature is a game-changer. Got my dream job in 3 weeks.',
    rating: 5
  }
];

export function SubscriptionPage({ initialProfile }: SubscriptionPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const isPro = initialProfile?.subscription_plan?.toLowerCase() === 'pro';
  const isCanceling = initialProfile?.subscription_status === 'canceled';
  const isActive = initialProfile?.subscription_status === 'active';

  const handleUpgrade = async () => {
    if (isPro) {
      try {
        setIsLoading(true);
        const result = await createPortalSession();
        if (result?.url) {
          window.location.href = result.url;
        }
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    } else {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
      if (priceId) {
        try {
          setIsLoading(true);
          const result = await postStripeSession({ priceId });
          if (result?.url) {
            window.location.href = result.url;
          }
        } catch (error) {
          console.error('Checkout error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const daysRemaining = initialProfile?.current_period_end
    ? Math.max(0, Math.ceil((new Date(initialProfile.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const endDate = initialProfile?.current_period_end 
    ? new Date(initialProfile.current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    : null;

  const monthlyPrice = 20;
  const yearlyPrice = 192; // $16/month billed yearly
  const savings = billingCycle === 'yearly' ? Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl pb-32">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {isPro && isActive ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Pro Member</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  You&apos;re All Set
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                You have full access to all premium features. Manage your subscription below.
              </p>
            </>
          ) : isCanceling ? (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">{daysRemaining} days remaining</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Don&apos;t Lose Access
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Your Pro access ends on {endDate}. Reactivate to keep landing interviews.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 border border-teal-500/30 mb-6">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-medium text-teal-300">Limited Time Offer</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Supercharge Your Job Search
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Join thousands of professionals landing their dream jobs with AI-powered resumes
              </p>
            </>
          )}
        </motion.div>

        {/* Social Proof */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-slate-400"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['SC', 'MJ', 'ER', 'AK'].map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white ring-2 ring-slate-900">
                    {initials}
                  </div>
                ))}
              </div>
              <span>12,000+ professionals</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </motion.div>
        )}

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-16"
        >
          <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10" />
            
            {/* Badge */}
            {!isPro && (
              <div className="absolute -top-px left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 rounded-b-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-xs font-semibold text-white">
                  MOST POPULAR
                </div>
              </div>
            )}

            <div className="relative">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">ResumeAI Pro</h2>
                
                {/* Billing Toggle */}
                {!isPro && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        billingCycle === 'monthly'
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-slate-300"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                        billingCycle === 'yearly'
                          ? "bg-slate-800 text-white"
                          : "text-slate-400 hover:text-slate-300"
                      )}
                    >
                      Yearly
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                        Save {savings}%
                      </span>
                    </button>
                  </div>
                )}

                {/* Price */}
                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={billingCycle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-baseline justify-center gap-1"
                    >
                      <span className="text-5xl font-bold text-white">${billingCycle === 'yearly' ? 16 : monthlyPrice}</span>
                      <span className="text-slate-400">/month</span>
                    </motion.div>
                  </AnimatePresence>
                  {billingCycle === 'yearly' && !isPro && (
                    <p className="text-sm text-slate-500 mt-1">Billed annually (${yearlyPrice}/year)</p>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className={cn(
                  "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 mb-6",
                  isPro
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : isPro ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>Manage Subscription</span>
                    <ExternalLink className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {/* Guarantees */}
              {!isPro && (
                <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>30-day money back</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              )}

              {/* Pro Status */}
              {isPro && isActive && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-400">Subscription Active</p>
                      <p className="text-sm text-slate-400">Next billing: {endDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Canceling Warning */}
              {isCanceling && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-400">Subscription Ending</p>
                      <p className="text-sm text-slate-400">Access until: {endDate}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            Compare Plans
          </h2>
          
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 mb-4 px-4">
              <div className="text-sm font-medium text-slate-400">Feature</div>
              <div className="text-sm font-medium text-slate-400 text-center">Free</div>
              <div className="text-sm font-medium text-center">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400">
                  Pro
                </span>
              </div>
            </div>

            {/* Feature Rows */}
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{feature.title}</p>
                      <p className="text-xs text-slate-500 hidden sm:block">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-sm text-slate-400">
                    {feature.free}
                  </div>
                  <div className="flex items-center justify-center text-sm text-teal-400 font-medium">
                    {feature.pro}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center mb-8 text-white">
              Loved by Professionals
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8 text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. You\'ll keep access until the end of your billing period.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and Apple Pay through our secure Stripe checkout.'
              },
              {
                q: 'Is there a free trial?',
                a: 'We offer a generous free tier with limited features. Upgrade to Pro when you\'re ready for unlimited access.'
              },
              {
                q: 'Can I switch plans later?',
                a: 'Absolutely! You can upgrade, downgrade, or switch between monthly and yearly billing at any time.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800"
              >
                <h3 className="font-medium text-white flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-teal-400" />
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-400 mt-2 pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
