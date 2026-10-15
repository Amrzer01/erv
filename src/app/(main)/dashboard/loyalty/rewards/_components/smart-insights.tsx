"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Lightbulb, Package, Target, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartInsightsProps {
  rewards: any[];
  redemptions: any[];
  loading: boolean;
}

export function SmartInsights({ rewards, redemptions, loading }: SmartInsightsProps) {
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

  // Out of stock rewards
  const outOfStockCount = rewards.filter((r) => !r.unlimited_stock && r.stock === 0).length;
  if (outOfStockCount > 0) {
    insights.push({
      type: "warning",
      icon: <Package className="size-4" />,
      text: `يوجد ${outOfStockCount} مكافأة نفذت مخزونها.`,
    });
  }

  // Low stock rewards
  const lowStockCount = rewards.filter((r) => !r.unlimited_stock && r.stock > 0 && r.stock < 10).length;
  if (lowStockCount > 0) {
    insights.push({
      type: "warning",
      icon: <AlertTriangle className="size-4" />,
      text: `يوجد ${lowStockCount} مكافأة بمخزون منخفض.`,
    });
  }

  // Total rewards
  if (rewards.length > 0) {
    insights.push({
      type: "info",
      icon: <Target className="size-4" />,
      text: `إجمالي المكافآت النشطة: ${rewards.filter((r) => r.is_active).length}.`,
    });
  }

  // Featured rewards
  const featuredCount = rewards.filter((r) => r.featured).length;
  if (featuredCount > 0) {
    insights.push({
      type: "success",
      icon: <CheckCircle className="size-4" />,
      text: `يوجد ${featuredCount} مكافأة مميزة.`,
    });
  }

  // Pending redemptions
  const pendingCount = redemptions.filter((r) => r.status === "pending").length;
  if (pendingCount > 0) {
    insights.push({
      type: "warning",
      icon: <AlertTriangle className="size-4" />,
      text: `يوجد ${pendingCount} طلب استهلاك معلق.`,
    });
  }

  // Total redemptions
  const totalRedemptions = redemptions.filter((r) => r.status === "approved" || r.status === "delivered").length;
  if (totalRedemptions > 0) {
    insights.push({
      type: "success",
      icon: <TrendingUp className="size-4" />,
      text: `تم استهلاك ${totalRedemptions} مكافأة بنجاح.`,
    });
  }

  // Default insight if none
  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: <Lightbulb className="size-4" />,
      text: "ابدأ بإضافة مكافآت لرؤية رؤى ذكية.",
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
