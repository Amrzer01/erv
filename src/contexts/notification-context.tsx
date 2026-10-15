"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/app/(main)/dashboard/follow-up/_components/types";
import { useAuth } from "./auth-context";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentEmployee } = useAuth();
  const supabase = createClient();

  const refreshNotifications = async () => {
    if (!currentEmployee?.id) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("employee_id", currentEmployee.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.read_at).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!currentEmployee?.id) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("employee_id", currentEmployee.id);

      if (error) throw error;

      await refreshNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    if (!currentEmployee?.id) return;

    refreshNotifications();

    // Subscribe to notification changes
    const channel = supabase
      .channel(`notifications_${currentEmployee.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `employee_id=eq.${currentEmployee.id}`,
        },
        () => {
          refreshNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentEmployee?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
