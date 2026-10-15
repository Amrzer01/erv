"use client";

import { AlertCircle, Bot, CheckCircle2, Clock, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { PotentialClient } from "./types";
import { getFollowUpStatus } from "./utils";

interface FollowUpStatusBadgeProps {
  lead: PotentialClient;
}

export function FollowUpStatusBadge({ lead }: FollowUpStatusBadgeProps) {
  const status = getFollowUpStatus(lead);

  const getStatusConfig = () => {
    if (status === "بانتظار 5 دقائق") {
      return {
        icon: <Clock className="size-4" />,
        variant: "outline" as const,
        className: "border-blue-200 text-blue-700 bg-blue-50",
      };
    }
    if (status === "تم إرسال أول متابعة" || status === "تم إرسال ثاني متابعة") {
      return {
        icon: <Send className="size-4" />,
        variant: "default" as const,
        className: "bg-green-600 hover:bg-green-700",
      };
    }
    if (status === "بانتظار ساعة") {
      return {
        icon: <Clock className="size-4" />,
        variant: "outline" as const,
        className: "border-orange-200 text-orange-700 bg-orange-50",
      };
    }
    if (status === "تم إرسال آخر متابعة") {
      return {
        icon: <CheckCircle2 className="size-4" />,
        variant: "secondary" as const,
        className: "",
      };
    }
    return {
      icon: <Bot className="size-4" />,
      variant: "outline" as const,
      className: "border-gray-200 text-gray-700 bg-gray-50",
    };
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={`flex items-center gap-2 ${config.className}`}>
        {config.icon}
        <span>{status}</span>
      </Badge>
    </div>
  );
}
