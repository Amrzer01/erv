"use client";

import { useEffect, useState } from "react";

import { Award, Gift, MessageSquare, Repeat, Star, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "./types";

interface LoyaltyKpiCardsProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

interface KPIData {
  title: string;
  currentValue: number;
  target: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  unit?: string;
  status: "ahead" | "behind" | "on-track" | "pending";
  trend?: number;
}

export function LoyaltyKpiCards({ accounts, loading }: LoyaltyKpiCardsProps) {
  const [kpis, setKpis] = useState<KPIData[]>([]);

  useEffect(() => {
    if (!loading) {
      // 1) Registered Loyalty Members
      const totalMembers = accounts.length;
      const membersTarget = 5000;
      const membersProgress = (totalMembers / membersTarget) * 100;
      const membersRemaining = Math.max(0, membersTarget - totalMembers);

      // 2) Total Spending
      const totalSpent = accounts.reduce((sum, acc) => sum + acc.total_spent, 0);
      const spendingTarget = 500000; // 500k SAR
      const spendingProgress = (totalSpent / spendingTarget) * 100;

      // 3) Total Loyalty Points
      const totalPoints = accounts.reduce((sum, acc) => sum + acc.total_points, 0);
      const pointsTarget = 1000000; // 1M points
      const pointsProgress = (totalPoints / pointsTarget) * 100;

      // 4) Repeat Booking Rate
      const repeatCustomers = accounts.filter((acc) => acc.bookings_count >= 2).length;
      const repeatRate = totalMembers > 0 ? (repeatCustomers / totalMembers) * 100 : 0;
      const repeatTarget = 30;
      const repeatProgress = (repeatRate / repeatTarget) * 100;

      // 5) Customer Rating - No ratings system yet
      const ratingTarget = 4.9;

      // 6) Monthly Referrals
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyReferrals = accounts.reduce((sum, acc) => {
        if (acc.last_activity_at?.startsWith(currentMonth)) {
          return sum + (acc.referral_count || 0);
        }
        return sum;
      }, 0);
      const referralsTarget = 200;
      const referralsProgress = (monthlyReferrals / referralsTarget) * 100;

      setKpis([
        {
          title: "أعضاء الولاء المسجلين",
          currentValue: totalMembers,
          target: membersTarget,
          icon: <Users className="size-5" />,
          color: "text-blue-500",
          gradient: "from-blue-500 to-blue-600",
          status: membersProgress >= 100 ? "ahead" : "behind",
        },
        {
          title: "إجمالي الإنفاق",
          currentValue: totalSpent,
          target: spendingTarget,
          icon: <TrendingUp className="size-5" />,
          color: "text-green-500",
          gradient: "from-green-500 to-green-600",
          unit: "SAR",
          status: spendingProgress >= 100 ? "ahead" : "behind",
        },
        {
          title: "إجمالي نقاط الولاء",
          currentValue: totalPoints,
          target: pointsTarget,
          icon: <Award className="size-5" />,
          color: "text-purple-500",
          gradient: "from-purple-500 to-purple-600",
          status: pointsProgress >= 100 ? "ahead" : "behind",
        },
        {
          title: "معدل الحجوزات المتكررة",
          currentValue: repeatRate,
          target: repeatTarget,
          icon: <Repeat className="size-5" />,
          color: "text-orange-500",
          gradient: "from-orange-500 to-orange-600",
          unit: "%",
          status: repeatProgress >= 100 ? "ahead" : repeatProgress >= 80 ? "on-track" : "behind",
        },
        {
          title: "تقييم العملاء",
          currentValue: 0,
          target: ratingTarget,
          icon: <Star className="size-5" />,
          color: "text-amber-500",
          gradient: "from-amber-500 to-amber-600",
          unit: "/ 5",
          status: "pending",
        },
        {
          title: "الإحالات الشهرية",
          currentValue: monthlyReferrals,
          target: referralsTarget,
          icon: <Gift className="size-5" />,
          color: "text-pink-500",
          gradient: "from-pink-500 to-pink-600",
          status: referralsProgress >= 100 ? "ahead" : "behind",
        },
      ]);
    }
  }, [accounts, loading]);

  const getStatusBadge = (status: KPIData["status"]) => {
    switch (status) {
      case "ahead":
        return <Badge className="bg-green-500 hover:bg-green-600">ممتاز</Badge>;
      case "on-track":
        return <Badge className="bg-blue-500 hover:bg-blue-600">في المسار</Badge>;
      case "behind":
        return <Badge className="bg-red-500 hover:bg-red-600">يحتاج تحسين</Badge>;
      case "pending":
        return <Badge className="bg-gray-500 hover:bg-gray-600">قيد الانتظار</Badge>;
    }
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    if (unit === "/ 5") {
      return "0 / 5";
    }
    return `${value.toLocaleString("ar-SA")}${unit ? ` ${unit}` : ""}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-10 w-20 mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpis.map((kpi, index) => {
        const progress = Math.min(100, (kpi.currentValue / kpi.target) * 100);
        const remaining = Math.max(0, kpi.target - kpi.currentValue);

        return (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-opacity-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center gap-3 ${kpi.color}`}>
                  <div className={`p-3 bg-gradient-to-br ${kpi.gradient} rounded-xl text-white shadow-lg`}>
                    {kpi.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold opacity-90">{kpi.title}</h3>
                    {getStatusBadge(kpi.status)}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold text-black mb-1">
                  {kpi.title === "تقييم العملاء" ? (
                    <span className="text-gray-400">لا توجد تقييمات بعد</span>
                  ) : (
                    formatValue(kpi.currentValue, kpi.unit)
                  )}
                </div>
                {kpi.title !== "تقييم العملاء" && (
                  <p className="text-sm text-muted-foreground">
                    الهدف: {kpi.target.toLocaleString("ar-SA")}
                    {kpi.unit}
                  </p>
                )}
              </div>

              {kpi.title !== "تقييم العملاء" && (
                <>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}%</span>
                    <span>{remaining > 0 ? `باقي ${remaining.toLocaleString("ar-SA")}` : "تم تحقيق الهدف"}</span>
                  </div>
                </>
              )}

              {kpi.title === "تقييم العملاء" && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">بانتظار نظام التقييمات</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
