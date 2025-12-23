"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";

function checkForApiKeys() {
  const storedKeys = localStorage.getItem("resumeai-api-keys");
  if (!storedKeys) return false;

  try {
    const keys = JSON.parse(storedKeys);
    return Array.isArray(keys) && keys.length > 0;
  } catch {
    return false;
  }
}

export function ApiKeyAlert() {
  const [hasApiKeys, setHasApiKeys] = useState(true); // Start with true to prevent flash

  useEffect(() => {
    setHasApiKeys(checkForApiKeys());

    // Listen for storage changes
    const handleStorageChange = () => {
      setHasApiKeys(checkForApiKeys());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (hasApiKeys) return null;

  return (
    <Alert className="border-0 p-0 bg-transparent z-10">
      <AlertDescription className="p-0">
        <div className="relative overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-xl border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

          <div className="relative p-4">
            {/* Main Content - Horizontal Layout */}
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Unlock Full AI Power
                  </h3>
                  <Crown className="w-4 h-4 text-emerald-400" />
                  <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    Most Popular
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    🚀 Unlimited resumes
                  </span>
                  <span className="flex items-center gap-1">
                    🤖 Latest AI models
                  </span>
                  <span className="flex items-center gap-1">
                    ⚡ Instant access
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Join 1,000+ professionals using Pro
                </p>
              </div>

              {/* CTA */}
              <div className="flex-shrink-0">
                <ProUpgradeButton />
              </div>
            </div>

            {/* Secondary Option - Collapsed */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Or use your own API keys:</span>
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors underline"
                  >
                    Anthropic <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href="https://platform.openai.com/docs/quickstart/create-and-export-an-api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors underline"
                  >
                    OpenAI <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href="https://developers.google.com/gemini/docs/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors underline"
                  >
                    Gemini <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <Link href="/settings">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-emerald-400 h-6 px-2 hover:bg-transparent hover:scale-105 hover:text-white transition-transform"
                  >
                    Configure
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
