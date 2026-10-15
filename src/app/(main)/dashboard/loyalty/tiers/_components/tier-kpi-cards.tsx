"use client";

import { motion } from "framer-motion";
import { Award, Crown, Medal, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface TierKpiCardsProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function TierKpiCards({ accounts, loading }: TierKpiCardsProps) {
  const silverCount = accounts.filter((a) => a.loyalty_tier === "Silver").length;
  const goldCount = accounts.filter((a) => a.loyalty_tier === "Gold").length;
  const platinumCount = accounts.filter((a) => a.loyalty_tier === "Platinum").length;
  const total = accounts.length;

  const silverPercent = total > 0 ? ((silverCount / total) * 100).toFixed(1) : "0";
  const goldPercent = total > 0 ? ((goldCount / total) * 100).toFixed(1) : "0";
  const platinumPercent = total > 0 ? ((platinumCount / total) * 100).toFixed(1) : "0";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Silver */}
      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl">
                <Medal className="size-6 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">{silverPercent}%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{silverCount}</h3>
            <p className="text-sm text-muted-foreground">أعضاء فضي</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gold */}
      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-all duration-300 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl">
                <Award className="size-6 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">{goldPercent}%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{goldCount}</h3>
            <p className="text-sm text-muted-foreground">أعضاء ذهبي</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platinum */}
      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-xl">
                <Crown className="size-6 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">{platinumPercent}%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{platinumCount}</h3>
            <p className="text-sm text-muted-foreground">أعضاء بلاتيني</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total */}
      <motion.div variants={item}>
        <Card className="hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Users className="size-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{total}</h3>
            <p className="text-sm text-muted-foreground">إجمالي الأعضاء</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
