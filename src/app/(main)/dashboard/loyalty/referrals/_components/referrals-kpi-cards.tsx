"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle, Clock, Target, TrendingUp, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralsKpiCardsProps {
  referrals: any[];
  accounts: any[];
  transactions: any[];
  loading: boolean;
}

export function ReferralsKpiCards({ referrals, accounts, transactions, loading }: ReferralsKpiCardsProps) {
  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter((r) => r.status === "booked").length;
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length;
  const totalReferralPoints = accounts.reduce((sum, acc) => sum + (acc.referral_points || 0), 0);
  const successRate = totalReferrals > 0 ? ((completedReferrals / totalReferrals) * 100).toFixed(1) : "0";

  const topReferrer =
    accounts.length > 0 ? [...accounts].sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0))[0] : null;

  const cards = [
    {
      title: "إجمالي الإحالات",
      value: totalReferrals,
      icon: <Users className="size-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "الإحالات المكتملة",
      value: completedReferrals,
      icon: <CheckCircle className="size-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "الإحالات المعلقة",
      value: pendingReferrals,
      icon: <Clock className="size-5" />,
      color: "from-orange-500 to-amber-500",
    },
    {
      title: "النقاط الممنوحة",
      value: totalReferralPoints,
      icon: <Award className="size-5" />,
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "نسبة النجاح",
      value: `${successRate}%`,
      icon: <Target className="size-5" />,
      color: "from-pink-500 to-rose-500",
      isPercentage: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className={`p-3 bg-gradient-to-br ${card.color} rounded-xl text-white mb-4`}>{card.icon}</div>

                <h4 className="text-2xl font-bold mb-1">
                  {card.isPercentage ? card.value : card.value.toLocaleString("ar-SA")}
                </h4>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {topReferrer && topReferrer.referral_count > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white">
                    <TrendingUp className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">أفضل محيل</p>
                    <p className="font-semibold text-lg">{topReferrer.customer_name}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {topReferrer.phone}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {topReferrer.referral_count?.toLocaleString("ar-SA")}
                  </p>
                  <p className="text-sm text-muted-foreground">إحالة</p>
                  <p className="text-xs text-muted-foreground mt-1">{topReferrer.loyalty_tier}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
