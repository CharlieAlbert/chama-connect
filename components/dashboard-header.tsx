"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { DashboardSidebarMobile } from "./dashboard-sidebar-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/initials";
import Image from "next/image";

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // Use user data from auth context and profile
  const displayName = user?.name || "User";
  const initials = getInitials(displayName);
  const avatarUrl = user?.avatar_url;

  return (
    <>
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-muted/50 text-foreground"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Link href="/dashboard" className="ml-2">
              <span className="text-lg font-bold text-emerald">
                Chama Connect
              </span>
            </Link>
          </div>

          <div className="flex-1 flex justify-end items-center space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-md hover:bg-muted/50 text-foreground relative"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald rounded-full"></span>
              </button>
            </div>

            <Link
              href="/dashboard/profile"
              className="hidden md:flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
            >
              {user?.avatar_url ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-border/50">
                  <Image
                    src={user?.avatar_url}
                    alt={user?.name || ""}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center border border-emerald/20">
                  <span className="text-xs font-medium text-emerald">
                    {getInitials(user?.name || "")}
                  </span>
                </div>
              )}
              <div className="ml-2">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">View profile</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <DashboardSidebarMobile
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
