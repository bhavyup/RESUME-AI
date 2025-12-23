'use client';

import { useEffect, useState } from 'react';

interface SubscriptionState {
  isProPlan: boolean;
  showUpgradeButton: boolean;
  isLoading: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isProPlan: false,
    showUpgradeButton: true,
    isLoading: true,
  });

  useEffect(() => {
    // Check localStorage cache first for instant UI
    const cached = localStorage.getItem('resumeai-subscription');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Use cached value if less than 5 minutes old
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          setState({
            isProPlan: parsed.isProPlan,
            showUpgradeButton: parsed.showUpgradeButton,
            isLoading: false,
          });
        }
      } catch {
        // Ignore cache errors
      }
    }

    // Fetch fresh data in background
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription-status');
        if (response.ok) {
          const data = await response.json();
          
          // Check if user has Pro access:
          // - Active Pro subscription OR
          // - Canceled Pro subscription that hasn't expired yet
          const isProPlan = data.subscription_plan?.toLowerCase() === 'pro';
          const isActive = data.subscription_status === 'active';
          const isCanceledButValid = data.subscription_status === 'canceled' && 
            data.current_period_end && 
            new Date(data.current_period_end) > new Date();
          
          const isPro = isProPlan && (isActive || isCanceledButValid);
          
          const newState = {
            isProPlan: isPro || false,
            showUpgradeButton: !isPro || isCanceledButValid,
            isLoading: false,
          };
          
          setState(newState);
          
          // Cache the result
          localStorage.setItem('resumeai-subscription', JSON.stringify({
            ...newState,
            timestamp: Date.now(),
          }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchSubscription();
  }, []);

  return state;
}
