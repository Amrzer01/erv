"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

interface Employee {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: "active" | "pending" | "inactive" | "disabled";
  is_super_admin: boolean;
  department: string | null;
  role: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  currentEmployee: Employee | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refreshEmployee: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const refreshEmployee = async () => {
    if (!currentUser) {
      setCurrentEmployee(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("auth_user_id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching employee:", error);
        // Employee lookup failure should NOT cause logout
        // This is a database issue, not an authentication issue
        setCurrentEmployee(null);
      } else if (!data) {
        // Employee not found - user authenticated but no employee record
        console.warn("Employee record not found for user:", currentUser.id);
        // This is a data issue, not an authentication issue
        // Do NOT call signOut() here
        setCurrentEmployee(null);
      } else {
        setCurrentEmployee(data);
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      // Database errors should NOT cause authentication failure
      setCurrentEmployee(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setCurrentUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (currentUser) {
      refreshEmployee();
    } else {
      setCurrentEmployee(null);
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextType = {
    currentUser,
    currentEmployee,
    isLoading,
    isAuthenticated: !!currentUser,
    isAdmin: currentEmployee?.is_super_admin ?? false,
    refreshEmployee,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
