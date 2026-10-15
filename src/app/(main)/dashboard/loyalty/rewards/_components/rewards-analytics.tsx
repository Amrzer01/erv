"use client";

import { motion } from "framer-motion";
import { Award, BarChart3, Clock, DollarSign, Package, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface RewardsAnalyticsProps {
  rewards: any[];
  redemptions: any[];
  loading: boolean;
}

export function RewardsAnalytics({ rewards, redemptions, loading }: RewardsAnalyticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate analytics
  const totalRedemptions = redemptions.filter((r) => r.status === "approved" || r.status === "delivered").length;
  const totalPointsRedeemed = redemptions
    .filter((r) => r.status === "approved" || r.status === "delivered")
    .reduce((sum, r) => sum + (r.points_used || 0), 0);

  const averageRedemptionValue = totalRedemptions > 0 ? Math.round(totalPointsRedeemed / totalRedemptions) : 0;

  const topReward =
    rewards.length > 0 ? [...rewards].sort((a, b) => (b.points_required || 0) - (a.points_required || 0))[0] : null;

  const outOfStockRewards = rewards.filter((r) => !r.unlimited_stock && r.stock === 0).length;
  const lowStockRewards = rewards.filter((r) => !r.unlimited_stock && r.stock > 0 && r.stock < 10).length;

  const pendingRequests = redemptions.filter((r) => r.status === "pending").length;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = rewards.reduce(
    (acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostPopularCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  const metrics = [
    {
      title: "إجمالي الاستهلاك",
      value: totalRedemptions.toLocaleString("ar-SA"),
      icon: <Award className="size-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "النقاط المستهلكة",
      value: totalPointsRedeemed.toLocaleString("ar-SA"),
      icon: <TrendingUp className="size-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "متوسط القيمة",
      value: averageRedemptionValue.toLocaleString("ar-SA"),
      icon: <DollarSign className="size-5" />,
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "المكافآت النفذة",
      value: outOfStockRewards.toLocaleString("ar-SA"),
      icon: <Package className="size-5" />,
      color: "from-red-500 to-rose-500",
    },
    {
      title: "طلبات معلقة",
      value: pendingRequests.toLocaleString("ar-SA"),
      icon: <Clock className="size-5" />,
      color: "from-yellow-500 to-amber-500",
    },
    {
      title: "الفئة الأكثر شعبية",
      value: mostPopularCategory ? mostPopularCategory[0].replace(/_/g, " ") : "-",
      icon: <BarChart3 className="size-5" />,
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">تحليلات المكافآت</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className={`p-3 bg-gradient-to-br ${metric.color} rounded-xl text-white mb-4`}>{metric.icon}</div>

                <h4 className="text-2xl font-bold mb-1">{metric.value}</h4>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
