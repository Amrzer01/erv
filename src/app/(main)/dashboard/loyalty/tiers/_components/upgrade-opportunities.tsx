"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface UpgradeOpportunitiesProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function UpgradeOpportunities({ accounts, loading }: UpgradeOpportunitiesProps) {
  // Silver customers close to Gold (need 3 bookings within 6 months)
  const nearGold = accounts
    .filter((a) => a.loyalty_tier === "Silver" && a.bookings_count > 0 && a.bookings_count < 3)
    .map((a) => ({
      ...a,
      remaining: 3 - a.bookings_count,
      progress: (a.bookings_count / 3) * 100,
    }))
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 5);

  // Gold customers close to Platinum (need 5 bookings)
  const nearPlatinum = accounts
    .filter((a) => a.loyalty_tier === "Gold" && a.bookings_count >= 3 && a.bookings_count < 5)
    .map((a) => ({
      ...a,
      remaining: 5 - a.bookings_count,
      progress: (a.bookings_count / 5) * 100,
    }))
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
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
      {/* Near Gold */}
      <Card>
        <CardHeader>
          <CardTitle>قريبون من المستوى الذهبي</CardTitle>
        </CardHeader>
        <CardContent>
          {nearGold.length > 0 ? (
            <div className="space-y-4">
              {nearGold.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{customer.customer_name}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{customer.bookings_count} حجز</p>
                      <p className="text-xs text-muted-foreground">متبقي {customer.remaining}</p>
                    </div>
                  </div>
                  <Progress value={customer.progress} className="h-2" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا يوجد عملاء قريبين من المستوى الذهبي</div>
          )}
        </CardContent>
      </Card>

      {/* Near Platinum */}
      <Card>
        <CardHeader>
          <CardTitle>قريبون من المستوى البلاتيني</CardTitle>
        </CardHeader>
        <CardContent>
          {nearPlatinum.length > 0 ? (
            <div className="space-y-4">
              {nearPlatinum.map((customer, index) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{customer.customer_name}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{customer.bookings_count} حجز</p>
                      <p className="text-xs text-muted-foreground">متبقي {customer.remaining}</p>
                    </div>
                  </div>
                  <Progress value={customer.progress} className="h-2" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا يوجد عملاء قريبين من المستوى البلاتيني</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
