"use client";

import { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { AppHeader } from "@/components/layout/app-header";
import { Analytics } from "@vercel/analytics/react";
import { authService } from "@/lib/auth";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ authenticated: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // ADD THIS: Track if we're in the middle of logout
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    async function checkAuth() {
      // SKIP auth check if we're logging out
      if (isLoggingOutRef.current) {
        return;
      }

      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser ? { authenticated: true } : null);
      } else {
        setUser(null);
      }
      setIsLoading(false);
      setHasInitialized(true);
    }

    // Only show loading on initial mount
    if (!hasInitialized) {
      checkAuth();
    }

    const handleAuthChange = () => {
      // SKIP re-check if we're logging out
      if (isLoggingOutRef.current) {
        return;
      }

      console.log("🔄 Auth state changed, re-checking...");
      // Don't set loading to true on auth changes after initial load
      checkAuth();
    };

    // ADD THIS: Listen for logout event
    const handleLogoutStart = () => {
      console.log("🚪 Logout started - freezing layout");
      isLoggingOutRef.current = true;
    };

    window.addEventListener("auth-state-changed", handleAuthChange);
    window.addEventListener("auth-logout-start", handleLogoutStart);

    return () => {
      window.removeEventListener("auth-state-changed", handleAuthChange);
      window.removeEventListener("auth-logout-start", handleLogoutStart);
    };
  }, [hasInitialized]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </body>
      </html>
    );
  }

  const showUpgradeButton = true; // TODO: Check subscription
  const isProPlan = false; // TODO: Check subscription

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen h-screen flex flex-col">
          {user && (
            <AppHeader
              showUpgradeButton={showUpgradeButton}
              isProPlan={isProPlan}
            />
          )}
          {/* Padding for header and footer */}
          <main className="py-14 h-full">
            {children}
            <Analytics />
          </main>
          {user && <Footer />}
        </div>
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{
            style: {
              fontSize: "1rem",
              padding: "16px",
              minWidth: "400px",
              maxWidth: "500px",
            },
          }}
        />
      </body>
    </html>
  );
}
