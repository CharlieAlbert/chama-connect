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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/initials";
import Image from "next/image";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className="w-64 border-r border-border hidden md:block h-screen sticky top-0 overflow-auto">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-emerald">
              Chama Connect
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
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

          <p className="text-xs font-medium text-muted-foreground mt-6 mb-2 uppercase">
            Services
          </p>

          <NavItem
            href="/dashboard/loans"
            icon={<CreditCard size={18} />}
            label="Loan Processing"
            isActive={isActive("/dashboard/loans")}
          />

          <NavItem
            href="/dashboard/ruffle"
            icon={<Gift size={18} />}
            label="Monthly Ruffle"
            isActive={isActive("/dashboard/ruffle")}
          />

          <p className="text-xs font-medium text-muted-foreground mt-6 mb-2 uppercase">
            Account
          </p>

          <NavItem
            href="/dashboard/settings"
            icon={<Settings size={18} />}
            label="Settings"
            isActive={isActive("/dashboard/settings")}
          />

          <NavItem
            href="/auth/logout"
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
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        isActive ? "bg-emerald text-primary-foreground" : "hover:bg-muted"
      }`}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
