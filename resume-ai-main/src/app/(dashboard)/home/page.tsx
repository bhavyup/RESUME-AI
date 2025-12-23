/**
 * Home Page Component
 * 
 * This is the main dashboard page of the Resume AI application. It displays:
 * - User profile information
 * - Quick stats (profile score, resume counts, job postings)
 * - Base resume management
 * - Tailored resume management
 * 
 * The page implements a soft gradient minimalism design with floating orbs
 * and mesh overlay for visual interest.
 */

import { redirect } from "next/navigation";
import { countResumes } from "@/utils/actions/resumes/actions";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProfileRow } from "@/components/dashboard/profile-row";
import { WelcomeDialog } from "@/components/dashboard/welcome-dialog";
import { getGreeting } from "@/lib/utils";
import { ApiKeyAlert } from "@/components/dashboard/api-key-alert";
import { BaseResumesSection } from "@/components/dashboard/base-resumes-section";
import { TailoredResumesSection } from "@/components/dashboard/tailored-resumes-section";
import { getDashboardData } from "@/utils/actions";
import { checkSubscriptionPlan } from "@/utils/actions/stripe/actions";
import { Background } from "@/components/landing/Background";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Check if user is coming from confirmation
  const params = await searchParams;
  const isNewSignup = params?.type === 'signup' && params?.token_hash;

  // Fetch dashboard data - auth is already verified by middleware
  let data;
  try {
    data = await getDashboardData();
    if (!data.profile) {
      redirect("/");
    }
  } catch {
    // Redirect to login if error occurs
    redirect("/");
  }

  const { profile, baseResumes, tailoredResumes } = data;
  
  // Check if user is on Pro plan
  const subscription = await checkSubscriptionPlan();
  const isProPlan = subscription.plan === 'pro';
  
  // Count resumes for base and tailored sections
  const baseResumesCount = await countResumes('base');
  const tailoredResumesCount = await countResumes('tailored');

  // Free plan limits
  const canCreateBase = isProPlan || baseResumesCount < 2;
  const canCreateTailored = isProPlan || tailoredResumesCount < 4;


  // Display a friendly message if no profile exists
  if (!profile) {
    return (
      <main className="min-h-screen p-6 md:p-8 lg:p-10 relative flex items-center justify-center bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        
        <Card className="relative max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-emerald-500/5">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 text-slate-400 mx-auto" />
            <h2 className="text-2xl font-semibold text-slate-200">Profile Not Found</h2>
            <p className="text-slate-400">
              We couldn&apos;t find your profile information. Please contact support for assistance.
            </p>
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25">
              Contact Support
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    
    <main className="min-h-screen relative sm:pb-12 pb-40 bg-slate-950">

     

      {/* Welcome Dialog for New Signups */}
      <WelcomeDialog isOpen={!!isNewSignup} />
      
      {/* Dark Gradient Background with Emerald/Teal Orbs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
      {/* Profile Row Component */}
     
      <ProfileRow profile={profile} />
        
        <div className="pl-2 sm:pl-0 sm:container sm:max-none  max-w-7xl mx-auto  lg:px-8 md:px-8 sm:px-6 pt-4 ">  
          {/* Profile Overview */}
          <Background />
          <div className="mb-6 space-y-4">
            {/* API Key Alert */}
            { !isProPlan && <ApiKeyAlert />}
            
            {/* Greeting & Edit Button */}
            <div className="relative flex items-center justify-between z-10">
              <div>
                <h1 className="z-10 text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {getGreeting()}, {profile.first_name}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Welcome to your resume dashboard
                </p>
              </div>
            </div>

            

            {/* Resume Sections */}
            <div className="space-y-12" id="base-resumes">
              {/* Base Resumes Section */}
              <BaseResumesSection
                resumes={baseResumes}
                profile={profile}
                canCreateMore={canCreateBase}
              />

              {/* Divider */}
              <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
              </div>

              {/* Tailored Resumes Section */}
              <TailoredResumesSection
                resumes={tailoredResumes}
                baseResumes={baseResumes}
                profile={profile}
                canCreateMore={canCreateTailored}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
