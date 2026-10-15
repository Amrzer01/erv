"use client";

import { motion } from "framer-motion";
import { Award, Crown, Medal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface TopCustomersProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function TopCustomers({ accounts, loading }: TopCustomersProps) {
  const topCustomers = [...accounts].sort((a, b) => b.available_points - a.available_points).slice(0, 20);

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

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">أفضل 20 عميل</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {topCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full font-bold text-sm">
                {index + 1}
              </div>

              <Avatar className="size-10">
                <AvatarFallback className={`bg-gradient-to-br ${getTierColor(customer.loyalty_tier)} text-white`}>
                  {customer.customer_name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{customer.customer_name}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {customer.phone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {getTierIcon(customer.loyalty_tier)}
                <Badge variant="outline" className="text-xs">
                  {customer.loyalty_tier}
                </Badge>
              </div>

              <div className="text-left">
                <p className="font-bold">{customer.available_points.toLocaleString("ar-SA")}</p>
                <p className="text-xs text-muted-foreground">نقطة</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
