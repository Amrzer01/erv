"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PointsAnalyticsProps {
  transactions: any[];
  loading: boolean;
}

export function PointsAnalytics({ transactions, loading }: PointsAnalyticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate monthly data
  const monthlyData = transactions.reduce((acc: any, t: any) => {
    const month = t.created_at?.slice(0, 7) || "unknown";
    if (!acc[month]) {
      acc[month] = { earned: 0, redeemed: 0 };
    }
    if (t.type === "earned" && t.status !== "expired") {
      acc[month].earned += t.points || 0;
    } else if (t.type === "redeemed") {
      acc[month].redeemed += t.points || 0;
    }
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);

  // Calculate sources breakdown
  const sourceData = transactions.reduce((acc: any, t: any) => {
    acc[t.source] = (acc[t.source] || 0) + 1;
    return acc;
  }, {});

  const sources = Object.entries(sourceData).map(([name, count]) => ({
    name,
    count: count as number,
    percent: (((count as number) / transactions.length) * 100).toFixed(1),
  }));

  const sourceColors: Record<string, string> = {
    booking: "#3b82f6",
    referral: "#a855f7",
    welcome: "#22c55e",
    google_review: "#f59e0b",
    review_reminder: "#ef4444",
    manual: "#6366f1",
    double_points: "#ec4899",
    expired: "#94a3b8",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Earned Points */}
      <Card>
        <CardHeader>
          <CardTitle>النقاط المكتسبة شهرياً</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {sortedMonths.map((month, index) => {
              const value = monthlyData[month]?.earned || 0;
              const maxValue = Math.max(...sortedMonths.map((m) => monthlyData[m]?.earned || 0));
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

              return (
                <motion.div
                  key={month}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month.slice(5)}</span>
                  <span className="text-xs font-medium">{value.toLocaleString("ar-SA")}</span>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Redeemed Points */}
      <Card>
        <CardHeader>
          <CardTitle>النقاط المستهلكة شهرياً</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {sortedMonths.map((month, index) => {
              const value = monthlyData[month]?.redeemed || 0;
              const maxValue = Math.max(...sortedMonths.map((m) => monthlyData[m]?.redeemed || 0));
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

              return (
                <motion.div
                  key={month}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-rose-400 rounded-t-lg"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month.slice(5)}</span>
                  <span className="text-xs font-medium">{value.toLocaleString("ar-SA")}</span>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sources Breakdown */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>توزيع مصادر النقاط</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            {/* Donut Chart */}
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {sources.map((source, index) => {
                  const startAngle = sources.slice(0, index).reduce((acc, s) => acc + parseFloat(s.percent), 0) * 3.6;
                  const endAngle = startAngle + parseFloat(source.percent) * 3.6;
                  const largeArcFlag = parseFloat(source.percent) > 50 ? 1 : 0;

                  const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

                  return (
                    <motion.path
                      key={source.name}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={sourceColors[source.name] || "#94a3b8"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  );
                })}
                <circle cx="100" cy="100" r="50" fill="hsl(var(--background))" />
              </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {sources.map((source) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sourceColors[source.name] || "#94a3b8" }}
                  />
                  <div>
                    <p className="text-sm font-medium capitalize">{source.name}</p>
                    <p className="text-xs text-muted-foreground">{source.percent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
