"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

interface LoyaltyRewardsProps {
  loading?: boolean;
}

export function LoyaltyRewards({ loading: externalLoading }: LoyaltyRewardsProps) {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from("loyalty_rewards")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (err) {
      console.error("Error fetching rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="size-5" /> : <LucideIcons.Gift className="size-5" />;
  };

  const getStockDisplay = (reward: any) => {
    if (reward.unlimited_stock) return "غير محدود";
    if (reward.stock === 0) return "نفذت الكمية";
    return reward.stock?.toString() || "-";
  };

  const isOutOfStock = (reward: any) => {
    return !reward.unlimited_stock && reward.stock === 0;
  };

  if (loading || externalLoading) {
    return (
      <div>
        <h3 className="text-lg font-bold mb-4">مكافآت الولاء</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 mb-4" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-6 bg-muted rounded-full mb-4">
          <LucideIcons.Gift className="size-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">لا توجد مكافآت</h3>
        <p className="text-sm text-muted-foreground max-w-md">لم يتم إضافة مكافآت بعد</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">مكافآت الولاء</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map((reward, index) => {
          const outOfStock = isOutOfStock(reward);
          const featured = reward.featured;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={featured ? "md:col-span-2 lg:col-span-1 xl:col-span-2" : ""}
            >
              <Card
                className={`hover:shadow-lg transition-all duration-300 relative ${
                  outOfStock ? "opacity-60" : ""
                } ${featured ? "ring-2 ring-primary/50 shadow-xl" : ""}`}
              >
                {featured && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    مميز
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${reward.color || "from-blue-500 to-cyan-500"} rounded-xl text-white ${featured ? "size-14" : ""}`}
                    >
                      {getIconComponent(reward.icon || "Gift")}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={outOfStock ? "outline" : "default"}>{outOfStock ? "نفذت" : "متاح"}</Badge>
                      {reward.category && (
                        <Badge variant="outline" className="text-xs">
                          {reward.category}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h4 className={`font-semibold mb-1 ${featured ? "text-xl" : ""}`}>{reward.name_ar}</h4>
                  <p className={`text-sm text-muted-foreground mb-3 ${featured ? "text-base" : ""}`}>
                    {reward.description_ar}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">النقاط المطلوبة</span>
                      <span className={`font-bold ${featured ? "text-lg" : ""}`}>
                        {reward.points_required?.toLocaleString("ar-SA")}
                      </span>
                    </div>

                    {reward.cash_value && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">القيمة النقدية</span>
                        <span className="font-medium">{reward.cash_value.toLocaleString("ar-SA")} ريال</span>
                      </div>
                    )}

                    {reward.stock !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">المخزون</span>
                        <span className={`font-medium ${outOfStock ? "text-red-500" : ""}`}>
                          {getStockDisplay(reward)}
                        </span>
                      </div>
                    )}
                  </div>

                  {reward.partner_name && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">بالتعاون مع</p>
                      <p className="text-sm font-medium">{reward.partner_name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
