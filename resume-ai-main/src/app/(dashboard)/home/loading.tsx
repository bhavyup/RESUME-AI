import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";

export default function HomeLoading() {
  return (
    <main className="min-h-screen relative bg-slate-950">
      {/* Dark Background Layer with Emerald/Teal Orbs */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Dashboard Header */}
        <header className="sticky top-0 z-20 py-6 px-4 md:px-6 lg:px-8 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-lg">
          <div className="max-w-[1800px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-9 w-64 sm:w-72 bg-slate-800/50" />
                <Skeleton className="h-5 w-48 sm:w-56 bg-slate-800/50" />
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Skeleton className="h-10 w-24 bg-slate-800/50" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="relative max-w-[1800px] mx-auto space-y-6 md:space-y-8">
            {/* Main Row - Profile and Base Resumes side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-3">
                <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-xl shadow-emerald-500/5 h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-32 bg-slate-800/50" />
                      <Skeleton className="h-8 w-8 bg-slate-800/50" />
                    </div>
                    <div className="flex flex-col items-center gap-3 py-4">
                      <Skeleton className="h-24 w-24 rounded-full bg-slate-800/50" />
                      <Skeleton className="h-6 w-40 bg-slate-800/50" />
                      <Skeleton className="h-4 w-32 bg-slate-800/50" />
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-4 w-4 bg-slate-800/50" />
                          <Skeleton className="h-4 flex-1 bg-slate-800/50" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Base Resumes Section */}
              <div className="lg:col-span-9">
                <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-xl shadow-emerald-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-400" />
                      <Skeleton className="h-6 w-32 bg-slate-800/50" />
                    </div>
                    <Skeleton className="h-9 w-32 bg-slate-800/50" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4 bg-slate-800/30 border-slate-700/30">
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-3/4 bg-slate-700/50" />
                          <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
                          <div className="flex gap-2 pt-2">
                            <Skeleton className="h-8 w-16 bg-slate-700/50" />
                            <Skeleton className="h-8 w-16 bg-slate-700/50" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Tailored Resumes Section */}
            <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-400" />
                  <Skeleton className="h-6 w-40 bg-slate-800/50" />
                </div>
                <Skeleton className="h-9 w-24 bg-slate-800/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-4 bg-slate-800/30 border-slate-700/30">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4 bg-slate-700/50" />
                      <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
                      <Skeleton className="h-3 w-full bg-slate-700/50" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-16 bg-slate-700/50" />
                        <Skeleton className="h-8 w-16 bg-slate-700/50" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
