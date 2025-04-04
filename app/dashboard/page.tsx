import { RecentActivity } from "./dashboard-activity"
import { QuickActions } from "./dashboard-actions"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardMetrics } from "./dashboard-metrics"

export default function DashboardPage() {
  return (
    <div className="landing-page min-h-screen bg-background">
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

          <DashboardMetrics />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

