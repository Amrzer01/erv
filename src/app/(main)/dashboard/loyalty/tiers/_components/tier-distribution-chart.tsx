"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface TierDistributionChartProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function TierDistributionChart({ accounts, loading }: TierDistributionChartProps) {
  const silverCount = accounts.filter((a) => a.loyalty_tier === "Silver").length;
  const goldCount = accounts.filter((a) => a.loyalty_tier === "Gold").length;
  const platinumCount = accounts.filter((a) => a.loyalty_tier === "Platinum").length;
  const total = accounts.length;

  const silverPercent = total > 0 ? (silverCount / total) * 100 : 0;
  const goldPercent = total > 0 ? (goldCount / total) * 100 : 0;
  const platinumPercent = total > 0 ? (platinumCount / total) * 100 : 0;

  const data = [
    { name: "Silver", value: silverPercent, color: "#94a3b8", count: silverCount },
    { name: "Gold", value: goldPercent, color: "#eab308", count: goldCount },
    { name: "Platinum", value: platinumPercent, color: "#a855f7", count: platinumCount },
  ];

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع المستويات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          {/* Donut Chart */}
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
              {data.map((item, index) => {
                const startAngle = data.slice(0, index).reduce((acc, d) => acc + d.value, 0) * 3.6;
                const endAngle = startAngle + item.value * 3.6;
                const largeArcFlag = item.value > 50 ? 1 : 0;

                const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

                return (
                  <motion.path
                    key={item.name}
                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                );
              })}
              {/* Inner circle for donut effect */}
              <circle cx="100" cy="100" r="50" fill="hsl(var(--background))" />
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.value.toFixed(1)}% ({item.count})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
