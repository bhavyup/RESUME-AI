import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <main className="min-h-screen relative bg-slate-950">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 pt-4 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 bg-slate-800/50 mb-2" />
          <Skeleton className="h-5 w-72 bg-slate-800/50" />
        </div>

        {/* Profile Form Card */}
        <Card className="p-6 md:p-8 bg-slate-900/50 backdrop-blur-md border-slate-700/50 shadow-xl shadow-emerald-500/5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="h-32 w-32 rounded-full bg-slate-800/50 mb-4" />
            <Skeleton className="h-5 w-40 bg-slate-800/50 mb-2" />
            <Skeleton className="h-4 w-32 bg-slate-800/50" />
          </div>

          {/* Personal Info Section */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-36 bg-slate-800/50 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-slate-800/50" />
                    <Skeleton className="h-10 w-full bg-slate-800/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="pt-6 border-t border-slate-700/50">
              <Skeleton className="h-6 w-44 bg-slate-800/50 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-slate-800/50" />
                    <Skeleton className="h-10 w-full bg-slate-800/50" />
                  </div>
                ))}
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-40 bg-slate-800/50" />
                <Skeleton className="h-9 w-28 bg-slate-800/50" />
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-4 bg-slate-800/30 border-slate-700/30">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-48 bg-slate-700/50" />
                      <Skeleton className="h-4 w-36 bg-slate-700/50" />
                      <Skeleton className="h-4 w-24 bg-slate-700/50" />
                      <Skeleton className="h-20 w-full bg-slate-700/50" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div className="pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32 bg-slate-800/50" />
                <Skeleton className="h-9 w-28 bg-slate-800/50" />
              </div>
              <div className="space-y-4">
                {[1].map((i) => (
                  <Card key={i} className="p-4 bg-slate-800/30 border-slate-700/30">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-52 bg-slate-700/50" />
                      <Skeleton className="h-4 w-40 bg-slate-700/50" />
                      <Skeleton className="h-4 w-28 bg-slate-700/50" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6">
              <Skeleton className="h-10 w-32 bg-slate-800/50" />
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
