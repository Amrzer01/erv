"use client";

import { motion } from "framer-motion";
import { Activity, Coins, Gift, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface PointsKpiCardsProps {
  accounts: LoyaltyAccount[];
  transactions: any[];
  loading: boolean;
}

export function PointsKpiCards({ accounts, transactions, loading }: PointsKpiCardsProps) {
  const totalEarned = transactions
    .filter((t) => t.type === "earned" && t.status !== "expired")
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const totalRedeemed = transactions.filter((t) => t.type === "redeemed").reduce((sum, t) => sum + (t.points || 0), 0);

  const currentBalance = accounts.reduce((sum, acc) => sum + acc.available_points, 0);

  const avgPointsPerCustomer = accounts.length > 0 ? Math.round(currentBalance / accounts.length) : 0;

  const transactionCount = transactions.length;

  // Calculate most common source
  const sourceCounts = transactions.reduce((acc: any, t: any) => {
    acc[t.source] = (acc[t.source] || 0) + 1;
    return acc;
  }, {});

  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
  const topSourcePercent = transactionCount > 0 ? (((topSource?.[1] || 0) / transactionCount) * 100).toFixed(1) : "0";

  const targetPoints = 1000000;
  const progressPercent = Math.min((totalEarned / targetPoints) * 100, 100);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "إجمالي النقاط المكتسبة",
      value: totalEarned.toLocaleString("ar-SA"),
      target: targetPoints.toLocaleString("ar-SA"),
      progress: progressPercent,
      icon: <TrendingUp className="size-5" />,
      color: "from-green-500 to-emerald-500",
      showProgress: true,
    },
    {
      title: "النقاط المستهلكة",
      value: totalRedeemed.toLocaleString("ar-SA"),
      icon: <TrendingDown className="size-5" />,
      color: "from-red-500 to-rose-500",
      showProgress: false,
    },
    {
      title: "الرصيد الحالي",
      value: currentBalance.toLocaleString("ar-SA"),
      icon: <Wallet className="size-5" />,
      color: "from-blue-500 to-cyan-500",
      showProgress: false,
      glow: true,
    },
    {
      title: "متوسط النقاط لكل عميل",
      value: avgPointsPerCustomer.toLocaleString("ar-SA"),
      icon: <Users className="size-5" />,
      color: "from-purple-500 to-violet-500",
      showProgress: false,
    },
    {
      title: "عدد الحركات",
      value: transactionCount.toLocaleString("ar-SA"),
      icon: <Activity className="size-5" />,
      color: "from-orange-500 to-amber-500",
      showProgress: false,
    },
    {
      title: "أكثر مصدر للنقاط",
      value: `${topSourcePercent}%`,
      subtitle: topSource?.[0] || "N/A",
      icon: <Gift className="size-5" />,
      color: "from-pink-500 to-rose-500",
      showProgress: false,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {kpis.map((kpi, index) => (
        <motion.div key={index} variants={item}>
          <Card className={`hover:shadow-lg transition-all duration-300 ${kpi.glow ? "ring-2 ring-blue-500/50" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-br ${kpi.color} rounded-xl`}>{kpi.icon}</div>
                {kpi.showProgress && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">الهدف</p>
                    <p className="text-sm font-medium">{kpi.target}</p>
                  </div>
                )}
              </div>

              <h3 className="text-3xl font-bold mb-1">{kpi.value}</h3>
              <p className="text-sm text-muted-foreground mb-3">{kpi.title}</p>

              {kpi.subtitle && <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>}

              {kpi.showProgress && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">التقدم</span>
                    <span className="font-medium">{kpi.progress.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${kpi.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full bg-gradient-to-r ${kpi.color}`}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
