"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { DashboardSidebarMobile } from "./dashboard-sidebar-mobile";

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-muted"
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
                className="p-2 rounded-md hover:bg-muted relative"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald rounded-full"></span>
              </button>
            </div>

            <div className="hidden md:flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">JD</span>
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">John Doe</p>
              </div>
            </div>
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
