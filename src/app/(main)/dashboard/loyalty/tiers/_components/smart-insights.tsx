"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Lightbulb, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface SmartInsightsProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function SmartInsights({ accounts, loading }: SmartInsightsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = accounts.length;
  const silverCount = accounts.filter((a) => a.loyalty_tier === "Silver").length;
  const goldCount = accounts.filter((a) => a.loyalty_tier === "Gold").length;
  const platinumCount = accounts.filter((a) => a.loyalty_tier === "Platinum").length;

  const nearGold = accounts.filter(
    (a) => a.loyalty_tier === "Silver" && a.bookings_count > 0 && a.bookings_count < 3,
  ).length;
  const nearPlatinum = accounts.filter(
    (a) => a.loyalty_tier === "Gold" && a.bookings_count >= 3 && a.bookings_count < 5,
  ).length;

  const averageSpending = total > 0 ? Math.round(accounts.reduce((sum, acc) => sum + acc.total_spent, 0) / total) : 0;

  const insights = [];

  // Silver dominance insight
  if (silverCount > total * 0.5) {
    insights.push({
      type: "info",
      icon: <Lightbulb className="size-4" />,
      text: `معظم العملاء (${((silverCount / total) * 100).toFixed(0)}%) مازالوا في المستوى الفضي.`,
    });
  }

  // Near Gold insight
  if (nearGold > 0) {
    insights.push({
      type: "success",
      icon: <TrendingUp className="size-4" />,
      text: `يوجد ${nearGold} عميل قريب من المستوى الذهبي.`,
    });
  }

  // Near Platinum insight
  if (nearPlatinum > 0) {
    insights.push({
      type: "success",
      icon: <CheckCircle className="size-4" />,
      text: `يوجد ${nearPlatinum} عميل قريب من المستوى البلاتيني.`,
    });
  }

  // High spending insight
  if (averageSpending > 1000) {
    insights.push({
      type: "success",
      icon: <TrendingUp className="size-4" />,
      text: `متوسط الإنفاق مرتفع (${averageSpending.toLocaleString("ar-SA")} SAR).`,
    });
  }

  // Platinum insight
  if (platinumCount > 0) {
    insights.push({
      type: "info",
      icon: <CheckCircle className="size-4" />,
      text: `يوجد ${platinumCount} عضو بلاتيني مميز.`,
    });
  }

  // Default insight if none
  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: <Lightbulb className="size-4" />,
      text: "ابدأ بإضافة أعضاء لبرنامج الولاء لرؤية رؤى ذكية.",
    });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">رؤى ذكية</h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                insight.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20"
                  : insight.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-blue-50 dark:bg-blue-900/20"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  insight.type === "success"
                    ? "bg-green-500 text-white"
                    : insight.type === "warning"
                      ? "bg-yellow-500 text-white"
                      : "bg-blue-500 text-white"
                }`}
              >
                {insight.icon}
              </div>
              <p className="text-sm">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
