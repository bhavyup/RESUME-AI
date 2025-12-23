import { redirect } from "next/navigation";
import { getDashboardData } from "@/utils/actions";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Suspense } from "react";

// Force dynamic behavior and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditProfilePage() {
  // Fetch profile data and handle authentication
  let data;
  try {
    data = await getDashboardData();
  } catch (error: unknown) {
    void error
    redirect("/");
  }

  const { profile } = data;

  // Display a friendly message if no profile exists
  if (!profile) {
    redirect("/home");
  }

  return (
    <main className="min-h-screen relative bg-slate-950">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10">
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400">Loading...</div>}>
          <ProfileEditForm profile={profile} />
        </Suspense>
      </div>
    </main>
  );
} 