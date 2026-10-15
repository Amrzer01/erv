"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Lightbulb, Target, TrendingUp, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartInsightsProps {
  referrals: any[];
  accounts: any[];
  transactions: any[];
  loading: boolean;
}

export function SmartInsights({ referrals, accounts, transactions, loading }: SmartInsightsProps) {
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

  const insights = [];

  // Top referrer
  const topReferrer =
    accounts.length > 0 ? [...accounts].sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0))[0] : null;

  if (topReferrer && topReferrer.referral_count > 0) {
    insights.push({
      type: "success",
      icon: <TrendingUp className="size-4" />,
      text: `أفضل عميل في برنامج الإحالة هو ${topReferrer.customer_name} بـ ${topReferrer.referral_count} إحالة.`,
    });
  }

  // Pending referrals
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length;
  if (pendingReferrals > 0) {
    insights.push({
      type: "warning",
      icon: <AlertTriangle className="size-4" />,
      text: `يوجد ${pendingReferrals} إحالة لم تكتمل بعد.`,
    });
  }

  // Success rate
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter((r) => r.status === "booked").length;
  const successRate = totalReferrals > 0 ? ((completedReferrals / totalReferrals) * 100).toFixed(1) : "0";

  insights.push({
    type: "info",
    icon: <Target className="size-4" />,
    text: `معدل نجاح الإحالات هو ${successRate}%.`,
  });

  // Monthly rewards
  const currentMonth = new Date().toLocaleDateString("ar-SA", { month: "long", year: "numeric" });
  const monthlyRewards = transactions
    .filter((t) => {
      const tMonth = new Date(t.created_at).toLocaleDateString("ar-SA", { month: "long", year: "numeric" });
      return tMonth === currentMonth;
    })
    .reduce((sum, t) => sum + (t.points || 0), 0);

  if (monthlyRewards > 0) {
    insights.push({
      type: "success",
      icon: <CheckCircle className="size-4" />,
      text: `تم منح ${monthlyRewards.toLocaleString("ar-SA")} نقطة هذا الشهر.`,
    });
  }

  // Gold tier performance
  const goldReferrals = accounts
    .filter((a) => a.loyalty_tier === "Gold")
    .reduce((sum, a) => sum + (a.referral_count || 0), 0);

  const totalReferralCount = accounts.reduce((sum, a) => sum + (a.referral_count || 0), 0);

  if (totalReferralCount > 0 && goldReferrals > 0) {
    const goldPercentage = ((goldReferrals / totalReferralCount) * 100).toFixed(1);
    insights.push({
      type: "info",
      icon: <Users className="size-4" />,
      text: `العملاء الذهبيون يحققون ${goldPercentage}% من إجمالي الإحالات.`,
    });
  }

  // Default insight if none
  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: <Lightbulb className="size-4" />,
      text: "ابدأ بتشجيع الإحالات لرؤية رؤى ذكية.",
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
