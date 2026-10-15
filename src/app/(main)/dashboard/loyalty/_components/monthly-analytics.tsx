"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount } from "./types";

interface MonthlyAnalyticsProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

interface MonthlyData {
  month: string;
  newMembers: number;
  spending: number;
}

export function MonthlyAnalytics({ accounts, loading }: MonthlyAnalyticsProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [tierDistribution, setTierDistribution] = useState({
    Silver: 0,
    Gold: 0,
    Platinum: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (loading) return;

      try {
        setAnalyticsLoading(true);

        // Fetch monthly new members from loyalty_accounts
        const { data: loyaltyData } = await supabase
          .from("loyalty_accounts")
          .select("created_at")
          .order("created_at", { ascending: true });

        // Fetch monthly spending from clients
        const { data: clientsData } = await supabase
          .from("clients")
          .select("total_price, trip_date")
          .not("total_price", "is", null)
          .order("trip_date", { ascending: true });

        // Process monthly data
        const monthlyMap = new Map<string, { newMembers: number; spending: number }>();

        if (loyaltyData) {
          loyaltyData.forEach((acc) => {
            const month = acc.created_at?.slice(0, 7) || "";
            const current = monthlyMap.get(month) || { newMembers: 0, spending: 0 };
            monthlyMap.set(month, { ...current, newMembers: current.newMembers + 1 });
          });
        }

        if (clientsData) {
          clientsData.forEach((client) => {
            const month = client.trip_date?.slice(0, 7) || "";
            const current = monthlyMap.get(month) || { newMembers: 0, spending: 0 };
            monthlyMap.set(month, {
              ...current,
              spending: current.spending + (client.total_price || 0),
            });
          });
        }

        const sortedData = Array.from(monthlyMap.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-6); // Last 6 months

        setMonthlyData(sortedData);

        // Calculate tier distribution
        const distribution = accounts.reduce(
          (acc, accData) => {
            acc[accData.loyalty_tier] = (acc[accData.loyalty_tier] || 0) + 1;
            return acc;
          },
          { Silver: 0, Gold: 0, Platinum: 0 } as { Silver: number; Gold: number; Platinum: number },
        );

        setTierDistribution(distribution);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [accounts, loading]);

  if (analyticsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* New Members Chart */}
      <Card>
        <CardHeader>
          <CardTitle>أعضاء جدد شهرياً</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="h-48">
              <div className="flex items-end gap-2 h-full">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{
                        height: `${(data.newMembers / Math.max(...monthlyData.map((d) => d.newMembers))) * 100}%`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{data.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Spending Chart */}
      <Card>
        <CardHeader>
          <CardTitle>الإنفاق الشهري</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <div className="h-48">
              <div className="flex items-end gap-2 h-full">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                      style={{
                        height: `${(data.spending / Math.max(...monthlyData.map((d) => d.spending))) * 100}%`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{data.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
          )}
        </CardContent>
      </Card>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع المستويات</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Silver</span>
                    <span className="text-sm font-medium">{tierDistribution.Silver}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 transition-all"
                      style={{
                        width: `${(tierDistribution.Silver / accounts.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Gold</span>
                    <span className="text-sm font-medium">{tierDistribution.Gold}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{
                        width: `${(tierDistribution.Gold / accounts.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Platinum</span>
                    <span className="text-sm font-medium">{tierDistribution.Platinum}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{
                        width: `${(tierDistribution.Platinum / accounts.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
          )}
        </CardContent>
      </Card>

      {/* Repeat Booking Rate */}
      <Card>
        <CardHeader>
          <CardTitle>معدل الحجوزات المتكررة</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {((accounts.filter((a) => a.bookings_count >= 2).length / accounts.length) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">من العملاء لديهم حجزين أو أكثر</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{
                    width: `${(accounts.filter((a) => a.bookings_count >= 2).length / accounts.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
