"use client";

import { useEffect, useState } from "react";

import { AlertCircle, Clock, MessageSquare, Send, TrendingUp, Users } from "lucide-react";

import type { KpiData } from "./types";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  trend?: number;
}

function KpiCard({ title, value, icon, color, gradient, trend }: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === "number" ? value : 0;

  useEffect(() => {
    if (typeof value !== "number") return;

    const duration = 1000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetValue, value]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${gradient} p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className={`flex items-center gap-2 mb-2 ${color}`}>
          {icon}
          <span className="text-sm font-medium opacity-90">{title}</span>
        </div>
        <div className="text-3xl font-bold text-black">
          {typeof value === "number" ? displayValue.toLocaleString("ar-SA") : value}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            <TrendingUp className="size-3" />
            <span>
              {trend >= 0 ? "+" : ""}
              {trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface KpiCardsProps {
  kpiData: KpiData;
}

export function KpiCards({ kpiData }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard
        title="العملاء المحتملين"
        value={kpiData.potentialClients}
        icon={<Users className="size-5" />}
        color="text-blue-600"
        gradient="from-blue-50 to-blue-100 border-blue-200"
      />
      <KpiCard
        title="المتابعات المجدولة"
        value={kpiData.scheduledFollowUps}
        icon={<Clock className="size-5" />}
        color="text-purple-600"
        gradient="from-purple-50 to-purple-100 border-purple-200"
      />
      <KpiCard
        title="طلبات الدعم المفتوحة"
        value={kpiData.openHumanRequests}
        icon={<AlertCircle className="size-5" />}
        color="text-orange-600"
        gradient="from-orange-50 to-orange-100 border-orange-200"
      />
      <KpiCard
        title="متابعات اليوم"
        value={kpiData.todaysFollowUps}
        icon={<MessageSquare className="size-5" />}
        color="text-green-600"
        gradient="from-green-50 to-green-100 border-green-200"
      />
      <KpiCard
        title="الرسائل المرسلة اليوم"
        value={kpiData.messagesSentToday}
        icon={<Send className="size-5" />}
        color="text-cyan-600"
        gradient="from-cyan-50 to-cyan-100 border-cyan-200"
      />
      <KpiCard
        title="معدل النجاح"
        value={`${kpiData.successRate.toFixed(1)}%`}
        icon={<TrendingUp className="size-5" />}
        color="text-indigo-600"
        gradient="from-indigo-50 to-indigo-100 border-indigo-200"
      />
    </div>
  );
}
