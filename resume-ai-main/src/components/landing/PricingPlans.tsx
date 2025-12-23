"use client";

import { useMemo, useRef } from "react";
import { Check, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { AuthDialog } from "@/components/auth/auth-dialog";

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: PlanFeature[];
  ctaText: string;
  ctaLink: string;
  ctaSecondary?: boolean;
}

export function PricingPlans() {
  // Refs for intersection observer
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Define pricing plans data for easier maintenance
  const plans = useMemo<PricingPlan[]>(
    () => [
      {
        name: "Free",
        price: "$0",
        description: "Self-host or use with your own API keys",
        features: [
          { text: "Use your own API keys" },
          { text: "2 base resumes" },
          { text: "5 tailored resumes" },
          { text: "Self-host option available" },
        ],
        ctaText: "Get Started",
        ctaLink: "/auth/register",
        ctaSecondary: true,
      },
      {
        name: "Pro",
        price: "$20",
        period: "/month",
        description: "Enhanced features for serious job seekers",
        badge: "Most Popular",
        popular: true,
        features: [
          { text: "Access to all premium AI models", highlight: true },
          { text: "Unlimited base resumes", highlight: true },
          { text: "Unlimited tailored resumes", highlight: true },
          { text: "Support an independent student developer ❤️" },
        ],
        ctaText: "Get Started",
        ctaLink: "/auth/register",
      },
    ],
    []
  );

  // Animation variants - simplified for performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Component for plan features with consistent styling
  const FeatureItem = ({ feature }: { feature: PlanFeature }) => (
    <div className="flex items-start">
      <Check
        className={`h-5 w-5 ${
          feature.highlight ? "text-teal-400" : "text-emerald-400"
        } mr-3 mt-0.5 flex-shrink-0`}
      />
      <span
        className={
          feature.highlight ? "font-medium text-slate-200" : "text-slate-300"
        }
      >
        {feature.text}
      </span>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 px-4 relative overflow-hidden scroll-mt-20 bg-slate-950 -z-0"
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      {/* Background decoration elements - simplified */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 blur-3xl"></div>

      {/* Heading */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-16">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-cyan-500/10 blur-3xl"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-3 mb-4"
        >
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-sm text-teal-400">
            Transparent Pricing
          </span>
        </motion.div>

        <motion.h2
          id="pricing-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
        >
          Select Your Path Forward
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 mt-4 max-w-2xl mx-auto"
        >
          Straightforward options with complete transparency—no surprises, no
          hidden costs
        </motion.p>
      </div>

      {/* Pricing Cards Grid */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={itemVariants}
            className={`
              relative rounded-2xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 overflow-hidden
              ${
                plan.popular
                  ? "bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                  : "bg-slate-900/50 border border-slate-700/50 shadow-md hover:shadow-lg backdrop-blur-sm"
              }
            `}
            aria-label={`${plan.name} plan for ${plan.price}${
              plan.period || ""
            }`}
          >
            {/* Popular plan indicator */}
            {plan.popular && (
              <>
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                ></div>
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{plan.badge}</span>
                </div>
              </>
            )}

            {/* Plan name badge */}
            <div className="px-3 py-1 w-fit rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-sm text-emerald-400 mb-4">
              {plan.name}
            </div>

            {/* Price display */}
            <div className="flex items-baseline">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {plan.price}
              </h3>
              {plan.period && (
                <span className="text-slate-400 ml-1">{plan.period}</span>
              )}
            </div>

            <p className="text-slate-300 mt-2 mb-6">{plan.description}</p>

            {/* CTA button */}
            <AuthDialog>
              <button
                className={`
                  block w-full py-3 rounded-lg font-medium text-center transition-all duration-300 hover:-translate-y-1 mb-8
                  ${
                    plan.ctaSecondary
                      ? "bg-slate-800/80 border border-slate-600/50 hover:bg-slate-700/80 text-slate-200"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
                  }
                `}
                aria-label={`${plan.ctaText} with the ${plan.name} plan`}
              >
                {plan.ctaSecondary ? (
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {plan.ctaText}
                  </span>
                ) : (
                  plan.ctaText
                )}
              </button>
            </AuthDialog>

            {/* Features list */}
            <div className="space-y-3">
              {plan.features.map((feature, i) => (
                <FeatureItem key={i} feature={feature} />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default PricingPlans;
