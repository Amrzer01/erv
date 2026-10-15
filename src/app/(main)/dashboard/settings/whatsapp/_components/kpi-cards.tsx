"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";

import type { AccountStats } from "./types";
import { formatRelativeTime } from "./utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

function KpiCard({ title, value, icon, color, gradient }: KpiCardProps) {
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
      </div>
    </div>
  );
}

interface KpiCardsProps {
  stats: AccountStats;
}

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="عدد الحسابات المتصلة"
        value={stats.totalAccounts}
        icon={<Users className="size-5" />}
        color="text-blue-600"
        gradient="from-blue-50 to-blue-100 border-blue-200"
      />
      <KpiCard
        title="عدد الحسابات النشطة"
        value={stats.activeAccounts}
        icon={<CheckCircle2 className="size-5" />}
        color="text-green-600"
        gradient="from-green-50 to-green-100 border-green-200"
      />
      <KpiCard
        title="عدد الحسابات غير النشطة"
        value={stats.inactiveAccounts}
        icon={<XCircle className="size-5" />}
        color="text-gray-600"
        gradient="from-gray-50 to-gray-100 border-gray-200"
      />
      <KpiCard
        title="آخر تحديث"
        value={formatRelativeTime(stats.lastUpdated)}
        icon={<Clock className="size-5" />}
        color="text-purple-600"
        gradient="from-purple-50 to-purple-100 border-purple-200"
      />
    </div>
  );
}
