"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Lightbulb, Target, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface SmartInsightsProps {
  accounts: LoyaltyAccount[];
  transactions: any[];
  loading: boolean;
}

export function SmartInsights({ accounts, transactions, loading }: SmartInsightsProps) {
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

  const totalEarned = transactions
    .filter((t) => t.type === "earned" && t.status !== "expired")
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const totalRedeemed = transactions.filter((t) => t.type === "redeemed").reduce((sum, t) => sum + (t.points || 0), 0);

  const currentBalance = accounts.reduce((sum, acc) => sum + acc.available_points, 0);

  // Calculate source breakdown
  const sourceCounts = transactions.reduce((acc: any, t: any) => {
    acc[t.source] = (acc[t.source] || 0) + (t.points || 0);
    return acc;
  }, {});

  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];

  const topCustomer =
    accounts.length > 0 ? [...accounts].sort((a, b) => b.available_points - a.available_points)[0] : null;

  const redemptionRate = totalEarned > 0 ? ((totalRedeemed / totalEarned) * 100).toFixed(1) : "0";

  const insights = [];

  // Most points source
  if (topSource) {
    insights.push({
      type: "info",
      icon: <Target className="size-4" />,
      text: `معظم النقاط جاءت من ${topSource[0]} (${((topSource[1] / totalEarned) * 100).toFixed(0)}%).`,
    });
  }

  // Redemption rate
  if (parseFloat(redemptionRate) < 20) {
    insights.push({
      type: "warning",
      icon: <AlertTriangle className="size-4" />,
      text: `نسبة استهلاك النقاط منخفضة (${redemptionRate}%).`,
    });
  } else {
    insights.push({
      type: "success",
      icon: <CheckCircle className="size-4" />,
      text: `نسبة استهلاك النقاط جيدة (${redemptionRate}%).`,
    });
  }

  // Top customer
  if (topCustomer && accounts.length > 0) {
    const percentOfTotal = ((topCustomer.available_points / currentBalance) * 100).toFixed(1);
    insights.push({
      type: "info",
      icon: <TrendingUp className="size-4" />,
      text: `أفضل عميل (${topCustomer.customer_name}) يمتلك ${percentOfTotal}% من إجمالي النقاط.`,
    });
  }

  // Current balance
  if (currentBalance > 0) {
    insights.push({
      type: "success",
      icon: <Lightbulb className="size-4" />,
      text: `إجمالي الرصيد الحالي: ${currentBalance.toLocaleString("ar-SA")} نقطة.`,
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
                className={`p-1.5 rounded-lg shrink-0 ${
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
