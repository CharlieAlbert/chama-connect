"use client"

import type React from "react";
import { JSX, useEffect, useState } from "react";
import { getRecentActivity, type ActivityItem } from "@/lib/supabase/server-extended/dashboard";
import { FileText, CreditCard, Users, Gift } from "lucide-react";
import formatRelativeTime from "@/utils/relative-time";

const ICONS: Record<string, JSX.Element> = {
  contribution: <CreditCard size={16} className="text-emerald" />,
  loan: <CreditCard size={16} className="text-emerald" />,
  minutes: <FileText size={16} className="text-emerald" />,
  ruffle: <Gift size={16} className="text-emerald" />,
  member: <Users size={16} className="text-emerald" />,
};

export function RecentActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getRecentActivity().then((data) => {
      if (mounted) {
        setActivity(data);
        setLoading(false);
      }
    });
    return () => { mounted = false };
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-4 text-muted-foreground">Loading...</div>
        ) : activity.length === 0 ? (
          <div className="p-4 text-muted-foreground">No recent activity</div>
        ) : (
          activity.map((item) => (
            <ActivityItem
              key={item.id}
              icon={ICONS[item.type] || <FileText size={16} className="text-emerald" />}
              title={item.title}
              description={item.description}
              timestamp={formatRelativeTime(item.timestamp)}
            />
          ))
        )}
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
