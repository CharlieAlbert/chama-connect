import type React from "react";
import { FileText, CreditCard, Users, Gift } from "lucide-react";

export function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>
      <div className="divide-y divide-border">
        <ActivityItem
          icon={<CreditCard size={16} className="text-emerald" />}
          title="Loan Approved"
          description="Your loan application for KES 50,000 has been approved"
          timestamp="2 hours ago"
        />
        <ActivityItem
          icon={<Users size={16} className="text-emerald" />}
          title="New Member"
          description="Sarah Wanjiku has joined Chama Connect"
          timestamp="Yesterday"
        />
        <ActivityItem
          icon={<FileText size={16} className="text-emerald" />}
          title="Meeting Minutes"
          description="April monthly meeting minutes have been published"
          timestamp="3 days ago"
        />
        <ActivityItem
          icon={<Gift size={16} className="text-emerald" />}
          title="Ruffle Winner"
          description="Jane Muthoni won the April monthly ruffle of KES 115,000"
          timestamp="Apr 30, 2025"
        />
        <ActivityItem
          icon={<CreditCard size={16} className="text-emerald" />}
          title="Contribution Received"
          description="Your monthly contribution of KES 10,000 has been received"
          timestamp="Apr 15, 2025"
        />
      </div>
      <div className="p-4 border-t border-border bg-muted/50">
        <button className="text-sm text-center w-full text-muted-foreground hover:text-foreground">
          View all activity
        </button>
      </div>
    </div>
  );
}

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
}

function ActivityItem({
  icon,
  title,
  description,
  timestamp,
}: ActivityItemProps) {
  return (
    <div className="p-4 hover:bg-muted/50">
      <div className="flex items-start">
        <div className="mt-0.5">{icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-xs text-muted-foreground">{timestamp}</div>
      </div>
    </div>
  );
}
