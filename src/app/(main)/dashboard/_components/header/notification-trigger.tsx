"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Bell, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/notification-context";
import { cn } from "@/lib/utils";

export function NotificationTrigger() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element for notification sound (using browser's built-in beep)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioRef.current = {
        play: async () => {
          try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = "sine";
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
            oscillator.stop(audioContext.currentTime + 0.5);
          } catch (e) {
            // Ignore audio errors
          }
        }
      } as any;
    }
  }, []);

  // Track user interaction for audio permissions
  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Play sound when new notification arrives
  useEffect(() => {
    if (unreadCount > 0 && hasInteracted && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [unreadCount, hasInteracted]);

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);

    // Navigate to relevant page based on notification type
    if (notification.type === "human_support_request" || notification.type === "assignment") {
      if (notification.potential_client_id) {
        router.push(`/dashboard/follow-up?client=${notification.potential_client_id}`);
      } else if (notification.phone) {
        router.push(`/dashboard/follow-up?phone=${notification.phone}`);
      } else {
        router.push("/dashboard/follow-up");
      }
    } else if (notification.type === "booking_conversion") {
      router.push("/dashboard/clients");
    }
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all(
      notifications.filter((n) => !n.read_at).map((n) => markAsRead(n.id))
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="font-semibold">الإشعارات</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="mb-2 size-8 opacity-50" />
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    !notification.read_at && "bg-muted/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="font-medium text-sm">{notification.title}</span>
                    {!notification.read_at && (
                      <span className="size-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString("ar-SA")}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
