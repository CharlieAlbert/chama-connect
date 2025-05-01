import { Suspense } from "react";
import { RecentActivity } from "./_components/dashboard-activity";
import { QuickActions } from "./_components/dashboard-actions";
import { DashboardMetrics } from "./_components/dashboard-metrics";

export default function DashboardPage() {
  return (
    <div className="landing-page min-h-screen bg-background">
      <div className="flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          {/* Prefetch and prerender metrics for fast loading */}
          <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse h-28" />}>
            <DashboardMetrics />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              {/* Prefetch and prerender activity for fast loading */}
              <Suspense fallback={<div className="p-4">Loading activity...</div>}>
                <RecentActivity />
              </Suspense>
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
