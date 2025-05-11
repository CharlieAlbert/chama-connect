"use client"

import { useEffect, useState } from "react";
import { getDashboardMetrics, type DashboardMetrics as MetricsType } from "@/lib/supabase/server-extended/dashboard";

// Extend MetricsType to include memberCount for correct typing
interface MetricsWithMembers extends MetricsType {
  memberCount: number;
  growthRate: number;
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<MetricsWithMembers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDashboardMetrics().then((data) => {
      if (mounted) {
        setMetrics(data);
        setLoading(false);
      }
    });
    return () => { mounted = false };
  }, []);

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Contributions"
        value={`KES ${metrics.totalContributions.toLocaleString()}`}
        change={`${metrics.growthRate >= 0 ? '+' : ''}${metrics.growthRate.toFixed(2)}%`}
        isPositive={metrics.growthRate >= 0}
      />
      <MetricCard
        title="Active Loans"
        value={`KES ${metrics.activeLoans.toLocaleString()}`}
        change={`${metrics.memberCount.toLocaleString()} members`}
        isPositive={true}
      />
      <MetricCard
        title="Next Meeting"
        value={metrics.nextMeeting ? new Date(metrics.nextMeeting).toLocaleDateString() : "N/A"}
        change={metrics.nextMeeting ? "Upcoming" : "No scheduled meeting"}
        isPositive={!!metrics.nextMeeting}
      />
      <MetricCard
        title="Ruffle Pot"
        value={`KES ${metrics.rufflePot.toLocaleString()}`}
        change="24 eligible members"
        isPositive={true}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function MetricCard({ title, value, change, isPositive }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p
        className={`text-xs mt-1 ${
          isPositive ? "text-emerald" : "text-destructive"
        }`}
      >
        {change}
      </p>
    </div>
  );
}
