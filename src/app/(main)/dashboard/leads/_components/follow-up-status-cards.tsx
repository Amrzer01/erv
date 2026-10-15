"use client";

import { AlertCircle, CheckCircle2, Clock, Hourglass, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { PotentialClient } from "./types";
import { getFollowUpStatus, getFollowUpStatusVariant } from "./utils";

interface FollowUpStatusCardsProps {
  leads: PotentialClient[];
}

export function FollowUpStatusCards({ leads }: FollowUpStatusCardsProps) {
  const statusCounts = {
    waiting5Minutes: leads.filter((lead) => getFollowUpStatus(lead) === "بانتظار 5 دقائق").length,
    firstReminderSent: leads.filter((lead) => getFollowUpStatus(lead) === "تم إرسال أول متابعة").length,
    secondReminderSent: leads.filter((lead) => getFollowUpStatus(lead) === "تم إرسال ثاني متابعة").length,
    waiting1Hour: leads.filter((lead) => getFollowUpStatus(lead) === "بانتظار ساعة").length,
    lastReminder: leads.filter((lead) => getFollowUpStatus(lead) === "تم إرسال آخر متابعة").length,
  };

  const cards = [
    {
      title: "بانتظار 5 دقائق",
      count: statusCounts.waiting5Minutes,
      icon: <Clock className="size-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "تم إرسال أول متابعة",
      count: statusCounts.firstReminderSent,
      icon: <Send className="size-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "تم إرسال ثاني متابعة",
      count: statusCounts.secondReminderSent,
      icon: <Send className="size-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "بانتظار ساعة",
      count: statusCounts.waiting1Hour,
      icon: <Hourglass className="size-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "تم إرسال آخر متابعة",
      count: statusCounts.lastReminder,
      icon: <CheckCircle2 className="size-5" />,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`relative overflow-hidden rounded-xl border ${card.borderColor} ${card.bgColor} p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className={`flex items-center gap-2 mb-2 ${card.color}`}>
              {card.icon}
              <span className="text-sm font-medium opacity-90">{card.title}</span>
            </div>
            <div className="text-3xl font-bold text-black">{card.count}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
