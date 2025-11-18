"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get("token");
      const expiresIn = searchParams.get("expiresIn");

      if (!token || !expiresIn) {
        setError("Invalid authentication response");
        return;
      }

      try {
        // Store token
        authService.handleOAuthCallback(token, parseInt(expiresIn));

        console.log("✅ Token stored successfully");

        // Hard redirect (no flash)
        window.location.href = "/home";
      } catch (err) {
        setError("Failed to process authentication");
        console.error("OAuth callback error:", err);
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative z-10 text-center space-y-4 p-8 rounded-2xl bg-slate-900/80 border border-red-500/20 max-w-md shadow-xl">
          <div className="text-red-400 text-4xl">⚠️</div>
          <h1 className="text-xl font-bold text-slate-200">
            Authentication Error
          </h1>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-medium rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative z-10 text-center space-y-6 p-8 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-xl backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
            Completing sign in...
          </h1>
          <p className="text-slate-400 text-sm">
            You&apos;ll be redirected to your dashboard in a moment
          </p>
        </div>
      </div>
    </div>
  );
}
