"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle, Clock, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeQuickActionsProps {
  referrals: any[];
  onViewReferral: (referral: any) => void;
}

export function EmployeeQuickActions({ referrals, onViewReferral }: EmployeeQuickActionsProps) {
  const pendingReferrals = referrals.filter((r) => r.status === "pending");
  const todayBooked = referrals.filter((r) => {
    const today = new Date().toDateString();
    return r.booking_completed && new Date(r.updated_at).toDateString() === today;
  });
  const todayRewarded = referrals.filter((r) => {
    const today = new Date().toDateString();
    return r.rewarded && r.rewarded_at && new Date(r.rewarded_at).toDateString() === today;
  });
  const failedReferrals = referrals.filter((r) => r.status === "cancelled");

  const actions = [
    {
      title: "الإحالات المعلقة",
      count: pendingReferrals.length,
      icon: <Clock className="size-5" />,
      color: "from-orange-500 to-amber-500",
      referrals: pendingReferrals,
    },
    {
      title: "حجوزات اليوم",
      count: todayBooked.length,
      icon: <CheckCircle className="size-5" />,
      color: "from-green-500 to-emerald-500",
      referrals: todayBooked,
    },
    {
      title: "مكافآت اليوم",
      count: todayRewarded.length,
      icon: <Award className="size-5" />,
      color: "from-purple-500 to-violet-500",
      referrals: todayRewarded,
    },
    {
      title: "الإحالات الملغاة",
      count: failedReferrals.length,
      icon: <XCircle className="size-5" />,
      color: "from-red-500 to-rose-500",
      referrals: failedReferrals,
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => action.referrals.length > 0 && onViewReferral(action.referrals[0])}
            >
              <CardContent className="p-6">
                <div className={`p-3 bg-gradient-to-br ${action.color} rounded-xl text-white mb-4`}>{action.icon}</div>

                <h4 className="text-2xl font-bold mb-1">{action.count}</h4>
                <p className="text-sm text-muted-foreground">{action.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
