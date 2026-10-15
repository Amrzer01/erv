"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, Gift, TrendingUp, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface TierStatisticsProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function TierStatistics({ accounts, loading }: TierStatisticsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const highestPoints =
    accounts.length > 0 ? accounts.reduce((max, acc) => (acc.total_points > max.total_points ? acc : max)) : null;

  const highestSpending =
    accounts.length > 0 ? accounts.reduce((max, acc) => (acc.total_spent > max.total_spent ? acc : max)) : null;

  const mostBookings =
    accounts.length > 0 ? accounts.reduce((max, acc) => (acc.bookings_count > max.bookings_count ? acc : max)) : null;

  const newestMember =
    accounts.length > 0
      ? [...accounts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : null;

  const oldestMember =
    accounts.length > 0
      ? [...accounts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]
      : null;

  const largestReferral =
    accounts.length > 0
      ? accounts.reduce((max, acc) => ((acc.referral_count || 0) > (max.referral_count || 0) ? acc : max))
      : null;

  const stats = [
    {
      label: "أعلى نقاط",
      value: highestPoints ? highestPoints.total_points.toLocaleString("ar-SA") : "N/A",
      customer: highestPoints?.customer_name || "-",
      icon: <TrendingUp className="size-4" />,
    },
    {
      label: "أعلى إنفاق",
      value: highestSpending ? `${highestSpending.total_spent.toLocaleString("ar-SA")} SAR` : "N/A",
      customer: highestSpending?.customer_name || "-",
      icon: <DollarSign className="size-4" />,
    },
    {
      label: "أكثر حجوزات",
      value: mostBookings ? mostBookings.bookings_count.toLocaleString("ar-SA") : "N/A",
      customer: mostBookings?.customer_name || "-",
      icon: <Calendar className="size-4" />,
    },
    {
      label: "أحدث عضو",
      value: newestMember ? new Date(newestMember.created_at).toLocaleDateString("ar-SA") : "N/A",
      customer: newestMember?.customer_name || "-",
      icon: <Clock className="size-4" />,
    },
    {
      label: "أقدم عضو",
      value: oldestMember ? new Date(oldestMember.created_at).toLocaleDateString("ar-SA") : "N/A",
      customer: oldestMember?.customer_name || "-",
      icon: <Users className="size-4" />,
    },
    {
      label: "أكبر إحالات",
      value: largestReferral ? (largestReferral.referral_count || 0).toLocaleString("ar-SA") : "N/A",
      customer: largestReferral?.customer_name || "-",
      icon: <Gift className="size-4" />,
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">إحصائيات المستويات</h3>
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className="p-2 bg-primary/10 rounded-lg text-primary">{stat.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.customer}</p>
              </div>
              <p className="font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
