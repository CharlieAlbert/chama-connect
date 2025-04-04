export function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Contributions"
        value="KES 1,250,000"
        change="+12.5%"
        isPositive={true}
      />
      <MetricCard
        title="Active Loans"
        value="KES 450,000"
        change="5 members"
        isPositive={true}
      />
      <MetricCard
        title="Next Meeting"
        value="May 15, 2025"
        change="3 days from now"
        isPositive={true}
      />
      <MetricCard
        title="Ruffle Pot"
        value="KES 120,000"
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
