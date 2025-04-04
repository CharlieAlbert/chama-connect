"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

// Define types for our context
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<User | null>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshSession: async () => null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Public routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/reset-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      return data.session?.user || null;
    } catch (error) {
      console.error("Error refreshing session:", error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Initial session check and subscription to auth changes
  useEffect(() => {
    // Set up auth state listener
    const setupAuthListener = async () => {
      setIsLoading(true);
      
      // Get initial session
      await refreshSession();
      
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user || null);
          setIsLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuthListener();
  }, []);

  // Handle route protection
  useEffect(() => {
    const handleRouteProtection = async () => {
      if (isLoading) return;

      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthRoute = pathname.startsWith("/auth/");
      
      if (!user && !isPublicRoute && !isAuthRoute) {
        // Redirect to login if trying to access protected route without auth
        router.push("/auth/login");
      } else if (user && isAuthRoute) {
        // Redirect to dashboard if already authenticated and trying to access auth routes
        router.push("/dashboard");
      }
    };

    handleRouteProtection();
  }, [user, isLoading, pathname, router]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signOut,
      refreshSession,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}