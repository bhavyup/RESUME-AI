/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

/**
 * Home Page Component - CLIENT SIDE
 *
 * This is the main dashboard page of the Resume AI application. It displays:
 * - User profile information
 * - Base resume management
 * - Tailored resume management
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileRow } from "@/components/dashboard/profile-row";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { getGreeting } from "@/lib/utils";
import { ApiKeyAlert } from "@/components/dashboard/api-key-alert";
import {
  type SortOption,
  type SortDirection,
} from "@/components/resume/management/resume-sort-controls";
import { ResumesSection } from "@/components/dashboard/resumes-section";
import {
  dashboardApi,
  type DashboardData,
  type PersonalInfo,
  type ResumeSummary,
} from "@/lib/api";
import { authService } from "@/lib/auth";

// Convert Spring Boot resume summary to frontend Resume type
interface Resume {
  id: string;
  name: string;
  target_role: string | null;
  created_at: string;
  updated_at: string;
  type: "base" | "tailored";
}

function convertToResume(
  summary: ResumeSummary,
  type: "base" | "tailored"
): Resume {
  return {
    id: summary.id.toString(),
    name: summary.title,
    target_role: null, // We don't have this in summary, would need full resume
    created_at: summary.updatedAt,
    updated_at: summary.updatedAt,
    type,
  };
}

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  // Check auth and load data
  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        // Check if authenticated
        if (!authService.isAuthenticated()) {
          router.push("/");
          return;
        }

        // Fetch dashboard data
        const data = await dashboardApi.getDashboardData();

        // Only update state if component is still mounted
        if (isMounted) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard"
          );
        }

        // If 401, redirect to login
        if (
          err &&
          typeof err === "object" &&
          "status" in err &&
          err.status === 401
        ) {
          authService.logout();
          router.push("/");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    // Listen for auth changes
    const handleAuthChange = () => {
      console.log("🔄 Auth changed in dashboard, reloading...");
      if (isMounted) {
        setIsLoading(true);
        loadDashboard();
      }
    };

    window.addEventListener("auth-state-changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("auth-state-changed", handleAuthChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount, router doesn't need to trigger re-fetch

  // Sort parameters
  const baseSort = (searchParams.get("baseSort") as SortOption) || "createdAt";
  const baseDirection =
    (searchParams.get("baseDirection") as SortDirection) || "desc";
  const tailoredSort =
    (searchParams.get("tailoredSort") as SortOption) || "createdAt";
  const tailoredDirection =
    (searchParams.get("tailoredDirection") as SortDirection) || "desc";

  // Check if new signup
  const isNewSignup =
    searchParams.get("type") === "signup" && searchParams.get("token_hash");

  // Sort function
  function sortResumes(
    resumes: Resume[],
    sort: SortOption,
    direction: SortDirection
  ) {
    return [...resumes].sort((a, b) => {
      const modifier = direction === "asc" ? 1 : -1;
      switch (sort) {
        case "name":
          return modifier * a.name.localeCompare(b.name);
        case "jobTitle":
          return (
            modifier *
            ((a.target_role || "").localeCompare(b.target_role || "") || 0)
          );
        case "createdAt":
        default:
          return (
            modifier *
            (new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime())
          );
      }
    });
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto" />
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </main>
    );
  }
  // Error state
  if (error) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <Card className="relative z-10 max-w-md w-full p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl shadow-black/40">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-2xl font-semibold text-slate-100">
              Error Loading Dashboard
            </h2>
            <p className="text-slate-400">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:from-amber-600 hover:to-yellow-600 font-semibold shadow-lg shadow-amber-500/20"
            >
              Retry
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // No profile yet
  if (!dashboardData?.profile) {
    return (
      <main className="min-h-screen relative flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <Card className="relative z-10 max-w-md w-full p-8 bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-2xl shadow-black/40">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 mb-2 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/20 flex items-center justify-center">
              <User className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent mb-5">
              Set up your profile information first
            </h2>
            <Link href="/profile">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:from-amber-600 hover:to-yellow-600 font-semibold shadow-lg shadow-amber-500/20">
                Create Profile
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  // Convert API data to frontend types
  const profile = {
    first_name: dashboardData.profile.fullName?.split(" ")[0] || "",
    last_name:
      dashboardData.profile.fullName?.split(" ").slice(1).join(" ") || "",
    work_experience: [], // We don't have this in PersonalInfo, would need separate endpoint
    education: [],
    skills: [],
    projects: [],
  };

  // For now, treat all resumes as base (we don't have type in summary)
  // You'll need to add a field to ResumeSummaryDto to distinguish base vs tailored
  const allResumes = dashboardData.resumes.map((r) =>
    convertToResume(r, "base")
  );
  const baseResumes = sortResumes(
    allResumes.filter((r) => r.type === "base"),
    baseSort,
    baseDirection
  );
  const tailoredResumes = sortResumes(
    allResumes.filter((r) => r.type === "tailored"),
    tailoredSort,
    tailoredDirection
  );

  // Get subscription data from backend
  // For now, use hardcoded values until we add subscription to dashboard
  // TODO: Add subscription field to DashboardData or fetch separately
  const isProPlan = false; // Will be fetched from /api/subscription/status/flat  const isProPlan = false;
  const baseResumesCount = baseResumes.length;
  const tailoredResumesCount = tailoredResumes.length;
  const canCreateBase = isProPlan || baseResumesCount < 3;
  const canCreateTailored = isProPlan || tailoredResumesCount < 5;

  return (
    // Replace main dashboard background (around line 260)
    <main className="min-h-screen relative sm:pb-12 pb-40">
      <WelcomeDialog isOpen={!!isNewSignup} />

      {/* EXACT Landing Page Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-amber-600/10 to-emerald-600/10 rounded-full blur-2xl animate-pulse opacity-40 transform -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Profile Row Component */}
        <ProfileRow profile={profile} />

        <div className="pl-2 sm:pl-0 sm:container sm:max-none max-w-7xl mx-auto lg:px-8 md:px-8 sm:px-6 pt-4">
          {/* Profile Overview */}
          <div className="mb-6 space-y-4">
            {/* API Key Alert */}
            {!isProPlan && <ApiKeyAlert />}

            {/* Greeting & Edit Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
                  {getGreeting()}, {profile.first_name}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Welcome to your resume dashboard
                </p>
              </div>
            </div>

            {/* Resume Bookshelf */}
            <div className="">
              {/* Base Resumes Section */}
              <ResumesSection
                type="base"
                resumes={baseResumes}
                profile={profile}
                sortParam="baseSort"
                directionParam="baseDirection"
                currentSort={baseSort}
                currentDirection={baseDirection}
                canCreateMore={canCreateBase}
              />

              {/* Thin Divider */}
              <div className="relative py-2">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />{" "}
              </div>

              {/* Tailored Resumes Section */}
              <ResumesSection
                type="tailored"
                resumes={tailoredResumes}
                profile={profile}
                sortParam="tailoredSort"
                directionParam="tailoredDirection"
                currentSort={tailoredSort}
                currentDirection={tailoredDirection}
                baseResumes={baseResumes}
                canCreateMore={canCreateTailored}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
