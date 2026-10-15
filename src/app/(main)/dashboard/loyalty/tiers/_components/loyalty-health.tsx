"use client";

import { motion } from "framer-motion";
import { Calendar, CreditCard, DollarSign, Gift, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface LoyaltyHealthProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function LoyaltyHealth({ accounts, loading }: LoyaltyHealthProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = accounts.length;

  const averagePoints = total > 0 ? Math.round(accounts.reduce((sum, acc) => sum + acc.total_points, 0) / total) : 0;

  const averageBookings =
    total > 0 ? (accounts.reduce((sum, acc) => sum + acc.bookings_count, 0) / total).toFixed(1) : "0";

  const averageSpending = total > 0 ? Math.round(accounts.reduce((sum, acc) => sum + acc.total_spent, 0) / total) : 0;

  const averageReferrals =
    total > 0 ? (accounts.reduce((sum, acc) => sum + (acc.referral_count || 0), 0) / total).toFixed(1) : "0";

  const averageAvailablePoints =
    total > 0 ? Math.round(accounts.reduce((sum, acc) => sum + acc.available_points, 0) / total) : 0;

  const metrics = [
    {
      label: "متوسط النقاط",
      value: averagePoints.toLocaleString("ar-SA"),
      icon: <TrendingUp className="size-4" />,
    },
    {
      label: "متوسط الحجوزات",
      value: averageBookings,
      icon: <Calendar className="size-4" />,
    },
    {
      label: "متوسط الإنفاق",
      value: `${averageSpending.toLocaleString("ar-SA")} SAR`,
      icon: <DollarSign className="size-4" />,
    },
    {
      label: "متوسط الإحالات",
      value: averageReferrals,
      icon: <Gift className="size-4" />,
    },
    {
      label: "متوسط النقاط المتاحة",
      value: averageAvailablePoints.toLocaleString("ar-SA"),
      icon: <CreditCard className="size-4" />,
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">صحة برنامج الولاء</h3>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">{metric.icon}</div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
