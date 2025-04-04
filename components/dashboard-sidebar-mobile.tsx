"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Users,
  CreditCard,
  Gift,
  Home,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface DashboardSidebarMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebarMobile({
  isOpen,
  onClose,
}: DashboardSidebarMobileProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-background border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center"
            onClick={onClose}
          >
            <span className="text-xl font-bold text-emerald">
              Chama Connect
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
            Main
          </p>

          <NavItem
            href="/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
            isActive={isActive("/dashboard")}
            onClick={onClose}
          />

          <NavItem
            href="/dashboard/finances"
            icon={<BarChart3 size={18} />}
            label="Financial Tracking"
            isActive={isActive("/dashboard/finances")}
            onClick={onClose}
          />

          <NavItem
            href="/dashboard/minutes"
            icon={<FileText size={18} />}
            label="Meeting Minutes"
            isActive={isActive("/dashboard/minutes")}
            onClick={onClose}
          />

          <NavItem
            href="/dashboard/governance"
            icon={<Users size={18} />}
            label="Group Governance"
            isActive={isActive("/dashboard/governance")}
            onClick={onClose}
          />

          <p className="text-xs font-medium text-muted-foreground mt-6 mb-2 uppercase">
            Services
          </p>

          <NavItem
            href="/dashboard/loans"
            icon={<CreditCard size={18} />}
            label="Loan Processing"
            isActive={isActive("/dashboard/loans")}
            onClick={onClose}
          />

          <NavItem
            href="/dashboard/ruffle"
            icon={<Gift size={18} />}
            label="Monthly Ruffle"
            isActive={isActive("/dashboard/ruffle")}
            onClick={onClose}
          />

          <p className="text-xs font-medium text-muted-foreground mt-6 mb-2 uppercase">
            Account
          </p>

          <NavItem
            href="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Settings"
            isActive={isActive("/dashboard/settings")}
            onClick={onClose}
          />

          <NavItem
            href="/auth/logout"
            icon={<LogOut size={18} />}
            label="Logout"
            isActive={false}
            onClick={onClose}
          />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">JD</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Member</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        isActive ? "bg-emerald text-primary-foreground" : "hover:bg-muted"
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
