"use client";

import { useEffect, useState } from "react";

import { AlertTriangle, Clock, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount } from "./types";

interface BehavioralTriggersProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

interface DormantCustomer {
  id: string;
  customer_name: string;
  phone: string;
  loyalty_tier: string;
  months_inactive: number;
  available_points: number;
}

export function BehavioralTriggers({ accounts, loading }: BehavioralTriggersProps) {
  const [dormantCustomers, setDormantCustomers] = useState<DormantCustomer[]>([]);
  const [loadingDormant, setLoadingDormant] = useState(true);

  useEffect(() => {
    const fetchDormantCustomers = async () => {
      if (loading) return;

      try {
        setLoadingDormant(true);

        // Calculate dormant customers locally from loyalty_accounts
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        const dormant = accounts
          .filter((account) => {
            if (!account.last_trip_date) return false;
            const lastTrip = new Date(account.last_trip_date);
            return lastTrip < fourMonthsAgo;
          })
          .map((account) => {
            const lastTrip = new Date(account.last_trip_date);
            const monthsInactive = Math.floor((Date.now() - lastTrip.getTime()) / (1000 * 60 * 60 * 24 * 30));
            return {
              id: account.id,
              customer_name: account.customer_name,
              phone: account.phone,
              loyalty_tier: account.loyalty_tier,
              months_inactive: monthsInactive,
              available_points: account.available_points,
            };
          })
          .sort((a, b) => b.months_inactive - a.months_inactive)
          .slice(0, 10);

        setDormantCustomers(dormant);
      } catch (err) {
        console.error("Error fetching dormant customers:", err);
      } finally {
        setLoadingDormant(false);
      }
    };

    fetchDormantCustomers();
  }, [accounts, loading]);

  const handleLaunchCampaign = async (customer: DormantCustomer) => {
    try {
      // Create a customer followup
      const { error } = await supabase.from("customer_followups").insert({
        customer_name: customer.customer_name,
        phone: customer.phone,
        followup_type: "dormant_campaign",
        status: "pending",
        notes: "حملة 'نفتقدك' - خصم 20% للعملاء الخاملين",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(`تم إرسال حملة إعادة التفاعل لـ ${customer.customer_name}`);
    } catch (err) {
      console.error("Error launching campaign:", err);
      toast.error("فشل إرسال الحملة");
    }
  };

  if (loading || loadingDormant) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dormant Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5 text-orange-500" />
            العملاء الخاملين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dormantCustomers.length > 0 ? (
            <div className="space-y-3">
              {dormantCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{customer.customer_name}</span>
                      <Badge variant="outline">{customer.loyalty_tier}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.phone} • {customer.months_inactive} شهر غير نشط
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      النقاط المتاحة: {customer.available_points.toLocaleString("ar-SA")}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleLaunchCampaign(customer)} className="gap-2">
                    <Send className="size-4" />
                    إرسال
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
              <Clock className="size-8 mb-2 opacity-50" />
              <p>لا يوجد عملاء خاملين</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Missing Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="size-5 text-blue-500" />
            التقييمات المفقودة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
            <AlertTriangle className="size-8 mb-2 opacity-50" />
            <p className="text-center mb-2">بانتظار نظام التقييمات</p>
            <p className="text-sm text-center max-w-xs">سيظهر هنا العملاء الذين حجزوا مرتين أو أكثر دون تقديم تقييم</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
