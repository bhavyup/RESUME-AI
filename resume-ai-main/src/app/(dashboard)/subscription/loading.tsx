import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function SubscriptionLoading() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 pt-4 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-48 bg-slate-800/50 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 bg-slate-800/50 mx-auto" />
        </div>

        {/* Current Plan Card */}
        <Card className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-700/50 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 bg-slate-800/50" />
              <Skeleton className="h-8 w-24 bg-slate-800/50" />
            </div>
            <Skeleton className="h-10 w-36 bg-slate-800/50" />
          </div>
        </Card>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6 bg-slate-900/50 backdrop-blur-md border-slate-700/50">
              <div className="space-y-4">
                <Skeleton className="h-7 w-24 bg-slate-800/50" />
                <Skeleton className="h-10 w-32 bg-slate-800/50" />
                <Skeleton className="h-4 w-48 bg-slate-800/50" />
                
                <div className="pt-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 bg-slate-800/50" />
                      <Skeleton className="h-4 w-40 bg-slate-800/50" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-11 w-full bg-slate-800/50 mt-6" />
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <Skeleton className="h-8 w-64 bg-slate-800/50 mx-auto mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 bg-slate-900/50 backdrop-blur-md border-slate-700/50">
                <Skeleton className="h-5 w-3/4 bg-slate-800/50" />
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
