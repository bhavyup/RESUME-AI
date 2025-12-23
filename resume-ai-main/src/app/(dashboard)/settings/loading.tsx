import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 pt-4 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-32 bg-slate-800/50 mb-2" />
          <Skeleton className="h-5 w-64 bg-slate-800/50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-slate-900/50 backdrop-blur-md border-slate-700/50">
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full bg-slate-800/50" />
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-700/50">
              {/* Section Header */}
              <div className="mb-6">
                <Skeleton className="h-7 w-40 bg-slate-800/50 mb-2" />
                <Skeleton className="h-4 w-80 bg-slate-800/50" />
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-slate-800/50" />
                    <Skeleton className="h-10 w-full bg-slate-800/50" />
                  </div>
                ))}

                {/* API Keys Section */}
                <div className="pt-4 border-t border-slate-700/50">
                  <Skeleton className="h-6 w-32 bg-slate-800/50 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 flex-1 bg-slate-800/50" />
                        <Skeleton className="h-10 w-10 bg-slate-800/50" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Skeleton className="h-10 w-24 bg-slate-800/50" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
