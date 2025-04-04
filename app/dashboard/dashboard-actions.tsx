import type React from "react";
import Link from "next/link";
import { CreditCard, FileText, Calendar, Gift, BarChart3 } from "lucide-react";

export function QuickActions() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>
      <div className="p-6 space-y-4">
        <ActionButton
          href="/dashboard/loans/apply"
          icon={<CreditCard size={18} />}
          label="Apply for Loan"
        />
        <ActionButton
          href="/dashboard/finances/contribute"
          icon={<BarChart3 size={18} />}
          label="Make Contribution"
        />
        <ActionButton
          href="/dashboard/minutes/view"
          icon={<FileText size={18} />}
          label="View Minutes"
        />
        <ActionButton
          href="/dashboard/meetings"
          icon={<Calendar size={18} />}
          label="Upcoming Meetings"
        />
        <ActionButton
          href="/dashboard/ruffle"
          icon={<Gift size={18} />}
          label="Check Ruffle Status"
        />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function ActionButton({ href, icon, label }: ActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex items-center p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
    >
      <span className="mr-3 text-emerald">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
