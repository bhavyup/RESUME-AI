'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Clock, Zap, ArrowRight, Crown, Shield, Check, Users, TrendingUp } from "lucide-react"
import { cn } from '@/lib/utils';
import { createPortalSession } from '@/app/(dashboard)/subscription/stripe-session';
import { getSubscriptionStatus } from '@/utils/actions/stripe/actions';

interface Profile {
  subscription_plan: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export function SubscriptionSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      try {
        const data = await getSubscriptionStatus();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchSubscriptionStatus();
  }, []);

  const subscription_plan = profile?.subscription_plan;
  const subscription_status = profile?.subscription_status;
  const current_period_end = profile?.current_period_end;
  
  const isPro = subscription_plan?.toLowerCase() === 'pro';
  const isCanceling = subscription_status === 'canceled';

  const handlePortalSession = async () => {
    try {
      setIsLoading(true);
      const result = await createPortalSession();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      // Handle error silently
      void error
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate days remaining for canceling plan
  const daysRemaining = current_period_end
    ? Math.max(0, Math.ceil((new Date(current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const endDate = current_period_end 
    ? new Date(current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    : null;

  if (isLoadingProfile) {
    return (
      <div className="space-y-6 relative min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-slate-800 animate-pulse" />
          <div className="space-y-2 text-center">
            <div className="h-5 w-40 bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-slate-800/60 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isPro ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-slate-700"
          )}>
            {isPro ? (
              <Crown className="w-6 h-6 text-white" />
            ) : (
              <Users className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">
                {isPro ? "Pro Plan" : "Free Plan"}
              </h3>
              {isCanceling && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                  Canceling
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">
              {isCanceling 
                ? `Access until ${endDate} (${daysRemaining} days left)`
                : isPro 
                  ? "Unlimited access to all features"
                  : "Limited features available"
              }
            </p>
          </div>
        </div>
        
        {isPro && (
          <Button
            onClick={handlePortalSession}
            disabled={isLoading}
            variant="outline"
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            {isLoading ? "Loading..." : "Manage"}
          </Button>
        )}
      </div>

      {/* Upgrade CTA for Free Users */}
      {!isPro && (
        <div className="rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Upgrade to Pro</h3>
              </div>
              <p className="text-slate-300 text-sm max-w-md">
                Get unlimited resumes, advanced AI tailoring, and premium templates for just $20/month.
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                {["Unlimited resumes", "Premium AI", "Priority support"].map((feature) => (
                  <span key={feature} className="inline-flex items-center gap-1 text-purple-300">
                    <Check className="w-3.5 h-3.5" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handlePortalSession}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 shrink-0"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Upgrade Now <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Reactivation CTA for Canceling Users */}
      {isCanceling && (
        <div className="rounded-xl bg-amber-900/20 border border-amber-500/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Don&apos;t lose your Pro benefits
              </h4>
              <p className="text-sm text-amber-200/70 mt-1">
                Reactivate before {endDate} to keep unlimited access
              </p>
            </div>
            <Button
              onClick={handlePortalSession}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium shrink-0"
            >
              Reactivate Pro
            </Button>
          </div>
        </div>
      )}

      {/* Feature Comparison for Free Users */}
      {!isPro && (
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {[
            { icon: Zap, title: "AI Resume Tailoring", free: "Limited", pro: "Unlimited" },
            { icon: Star, title: "Base Resumes", free: "2 resumes", pro: "Unlimited" },
            { icon: TrendingUp, title: "AI Models", free: "Basic", pro: "Premium" },
            { icon: Shield, title: "Support", free: "Community", pro: "Priority" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800">
              <item.icon className="w-4 h-4 text-slate-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">{item.title}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{item.free}</p>
                <p className="text-xs text-purple-400">{item.pro}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 