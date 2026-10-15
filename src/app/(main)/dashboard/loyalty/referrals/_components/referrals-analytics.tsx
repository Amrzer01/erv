"use client";

import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralsAnalyticsProps {
  referrals: any[];
  transactions: any[];
  loading: boolean;
}

export function ReferralsAnalytics({ referrals, transactions, loading }: ReferralsAnalyticsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate monthly data
  const monthlyData = referrals.reduce((acc: any, r: any) => {
    const month = new Date(r.created_at).toLocaleDateString("ar-SA", { month: "short", year: "2-digit" });
    acc[month] = acc[month] || { month, total: 0, completed: 0, pending: 0, rewards: 0 };
    acc[month].total += 1;
    if (r.status === "booked") acc[month].completed += 1;
    if (r.status === "pending") acc[month].pending += 1;
    if (r.rewarded) acc[month].rewards += 1;
    return acc;
  }, {});

  const chartData = Object.values(monthlyData).slice(-12);

  const monthlyRewards = transactions.reduce((acc: any, t: any) => {
    const month = new Date(t.created_at).toLocaleDateString("ar-SA", { month: "short", year: "2-digit" });
    acc[month] = acc[month] || { month, points: 0 };
    acc[month].points += t.points || 0;
    return acc;
  }, {});

  const rewardsData = Object.values(monthlyRewards).slice(-12);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle>الإحالات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" name="الإجمالي" />
                <Bar dataKey="completed" fill="hsl(var(--success))" name="المكتملة" />
                <Bar dataKey="pending" fill="hsl(var(--warning))" name="المعلقة" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle>مكافآت الإحالات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rewardsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="points" stroke="hsl(var(--primary))" strokeWidth={2} name="النقاط" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
