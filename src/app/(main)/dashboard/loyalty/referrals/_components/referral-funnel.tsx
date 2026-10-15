"use client";

import { motion } from "framer-motion";
import { ArrowDown, Award, CheckCircle, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralFunnelProps {
  referrals: any[];
  loading: boolean;
}

export function ReferralFunnel({ referrals, loading }: ReferralFunnelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalReferrals = referrals.length;
  const bookedReferrals = referrals.filter((r) => r.booking_completed).length;
  const rewardedReferrals = referrals.filter((r) => r.rewarded).length;

  const stages = [
    {
      title: "إنشاء الإحالة",
      count: totalReferrals,
      icon: <Users className="size-5" />,
      color: "from-blue-500 to-cyan-500",
      percentage: 100,
    },
    {
      title: "إكمال الحجز",
      count: bookedReferrals,
      icon: <CheckCircle className="size-5" />,
      color: "from-green-500 to-emerald-500",
      percentage: totalReferrals > 0 ? ((bookedReferrals / totalReferrals) * 100).toFixed(1) : 0,
    },
    {
      title: "منح النقاط",
      count: rewardedReferrals,
      icon: <Award className="size-5" />,
      color: "from-purple-500 to-violet-500",
      percentage: totalReferrals > 0 ? ((rewardedReferrals / totalReferrals) * 100).toFixed(1) : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>مسار الإحالات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.title} className="relative">
              {index < stages.length - 1 && <div className="absolute left-8 top-12 bottom-0 w-0.5 bg-border" />}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${stage.color} rounded-xl text-white shrink-0`}>
                    {stage.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{stage.title}</h4>
                      <span className="text-2xl font-bold">{stage.count.toLocaleString("ar-SA")}</span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${stage.color}`}
                      />
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">{stage.percentage}%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
