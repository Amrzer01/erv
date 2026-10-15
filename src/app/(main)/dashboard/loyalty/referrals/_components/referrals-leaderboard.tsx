"use client";

import { motion } from "framer-motion";
import { Award, Crown, Medal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralsLeaderboardProps {
  accounts: any[];
  loading: boolean;
  onViewCustomer: (customer: any) => void;
}

export function ReferralsLeaderboard({ accounts, loading, onViewCustomer }: ReferralsLeaderboardProps) {
  const topReferrers = [...accounts]
    .filter((a) => (a.referral_count || 0) > 0)
    .sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0))
    .slice(0, 10);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return <Crown className="size-4" />;
      case "Gold":
        return <Award className="size-4" />;
      case "Silver":
        return <Medal className="size-4" />;
      default:
        return <Medal className="size-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "from-purple-500 to-emerald-500";
      case "Gold":
        return "from-yellow-400 to-yellow-500";
      case "Silver":
        return "from-slate-400 to-slate-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 to-amber-500";
      case 2:
        return "from-slate-300 to-slate-400";
      case 3:
        return "from-orange-400 to-orange-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

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

  if (topReferrers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">قائمة المتصدرين</h3>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-6 bg-muted rounded-full mb-4">
              <Medal className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">لا توجد إحالات</h3>
            <p className="text-sm text-muted-foreground max-w-md">لم يتم تسجيل أي إحالات بعد</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">قائمة المتصدرين</h3>
        <div className="space-y-3">
          {topReferrers.map((account, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md cursor-pointer ${
                  isTop3
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700"
                    : "bg-muted"
                }`}
                onClick={() => onViewCustomer(account)}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(rank)} text-white font-bold text-lg shadow-lg`}
                >
                  {rank}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{account.customer_name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {account.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {getTierIcon(account.loyalty_tier)}
                  <Badge variant="outline" className="text-xs">
                    {account.loyalty_tier}
                  </Badge>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">{account.referral_count?.toLocaleString("ar-SA")}</p>
                  <p className="text-xs text-muted-foreground">إحالة</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{account.referral_points?.toLocaleString("ar-SA")}</p>
                  <p className="text-xs text-muted-foreground">نقطة</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
