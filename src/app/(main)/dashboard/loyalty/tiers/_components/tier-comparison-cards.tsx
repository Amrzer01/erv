"use client";

import { motion } from "framer-motion";
import { Award, Crown, Gift, Headphones, Medal, Percent } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface TierComparisonCardsProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function TierComparisonCards({ accounts, loading }: TierComparisonCardsProps) {
  const silverCount = accounts.filter((a) => a.loyalty_tier === "Silver").length;
  const goldCount = accounts.filter((a) => a.loyalty_tier === "Gold").length;
  const platinumCount = accounts.filter((a) => a.loyalty_tier === "Platinum").length;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Silver */}
      <motion.div variants={item}>
        <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl">
                <Medal className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Silver</h3>
                <p className="text-sm text-muted-foreground">فضي</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium mb-1">الشرط</p>
                <p className="text-sm text-muted-foreground">أول حجز</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">المزايا</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent className="size-4" />
                  <span>خصم 5%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gift className="size-4" />
                  <span>نقاط مضاعفة لأول رحلة</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-2xl font-bold">{silverCount}</p>
              <p className="text-sm text-muted-foreground">عضو حالي</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gold */}
      <motion.div variants={item}>
        <Card className="border-yellow-200 dark:border-yellow-900 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl">
                <Award className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Gold</h3>
                <p className="text-sm text-muted-foreground">ذهبي</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium mb-1">الشرط</p>
                <p className="text-sm text-muted-foreground">٣ رحلات خلال آخر ٦ أشهر</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">المزايا</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Percent className="size-4" />
                  <span>خصم 10%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Headphones className="size-4" />
                  <span>خدمة عملاء مخصصة</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-2xl font-bold">{goldCount}</p>
              <p className="text-sm text-muted-foreground">عضو حالي</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platinum */}
      <motion.div variants={item}>
        <Card className="border-purple-200 dark:border-purple-900 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-xl">
                <Crown className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Platinum</h3>
                <p className="text-sm text-muted-foreground">بلاتيني</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium mb-1">الشرط</p>
                <p className="text-sm text-muted-foreground">٥ رحلات أو أكثر + تقييم مرتفع</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">المزايا</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gift className="size-4" />
                  <span>رحلة VIP مجانية سنوياً</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Crown className="size-4" />
                  <span>هدية مميزة</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-2xl font-bold">{platinumCount}</p>
              <p className="text-sm text-muted-foreground">عضو حالي</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
