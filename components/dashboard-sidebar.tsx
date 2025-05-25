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
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/initials";
import Image from "next/image";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    logout();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className="w-64 border-r border-border hidden md:block h-screen sticky top-0 overflow-auto bg-sidebar text-sidebar-foreground">
      <div className="h-full flex flex-col">
        <div className="p-4 h-16 border-b border-border flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-emerald">
              Chama Connect
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Main
          </p>

          <NavItem
            href="/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
            isActive={isActive("/dashboard")}
          />

          <NavItem
            href="/dashboard/finances"
            icon={<BarChart3 size={18} />}
            label="Financial Tracking"
            isActive={isActive("/dashboard/finances")}
          />

          <NavItem
            href="/dashboard/minutes"
            icon={<FileText size={18} />}
            label="Meeting Minutes"
            isActive={isActive("/dashboard/minutes")}
          />

          <NavItem
            href="/dashboard/governance"
            icon={<Users size={18} />}
            label="Group Governance"
            isActive={isActive("/dashboard/governance")}
          />

          <p className="text-xs font-medium text-muted-foreground mt-6 mb-3 uppercase tracking-wider">
            Services
          </p>

          <NavItem
            href="/dashboard/loans"
            icon={<CreditCard size={18} />}
            label="My Loans"
            isActive={isActive("/dashboard/loans")}
          />
          <NavItem
            href="/dashboard/loans/apply"
            icon={<CreditCard size={18} />}
            label="Apply for Loan"
            isActive={isActive("/dashboard/loans/apply")}
          />
          {user?.role === "treasurer" || user?.role === "super-admin" ? (
            <NavItem
              href="/dashboard/loans/review"
              icon={<ShieldCheck size={18} />}
              label="Review Loans"
              isActive={isActive("/dashboard/loans/review")}
            />
          ) : null}

          <NavItem
            href="/dashboard/ruffle"
            icon={<Gift size={18} />}
            label="Monthly Ruffle"
            isActive={isActive("/dashboard/ruffle")}
          />

          <p className="text-xs font-medium text-muted-foreground mt-6 mb-3 uppercase tracking-wider">
            Account
          </p>

          <NavItem
            href="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Settings"
            isActive={isActive("/dashboard/settings")}
          />

          <NavItem
            href="#"
            onClick={handleSignOut}
            icon={<LogOut size={18} />}
            label="Logout"
            isActive={false}
          />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">
                {user?.avatar_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={user?.avatar_url}
                      alt={user?.name || ""}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {getInitials(user?.name || "")}
                    </span>
                  </div>
                )}
              </span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void | Promise<void>;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors w-full ${
          isActive
            ? "bg-emerald text-white font-medium shadow-sm"
            : "hover:bg-accent/20 text-sidebar-foreground"
        }`}
      >
        <span className={`mr-3 ${isActive ? "text-white" : "text-emerald"}`}>
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  }
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-colors ${
        isActive
          ? "bg-emerald text-white font-medium shadow-sm"
          : "hover:bg-accent/20 text-sidebar-foreground"
      }`}
    >
      <span className={`mr-3 ${isActive ? "text-white" : "text-emerald"}`}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
