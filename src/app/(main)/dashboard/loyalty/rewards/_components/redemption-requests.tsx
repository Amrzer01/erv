"use client";

import { motion } from "framer-motion";
import { Check, MoreHorizontal, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

interface RedemptionRequestsProps {
  redemptions: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function RedemptionRequests({ redemptions, loading, onRefresh }: RedemptionRequestsProps) {
  const handleApprove = async (redemption: any) => {
    try {
      // Update redemption status
      const { error: updateError } = await supabase
        .from("loyalty_redemptions")
        .update({ status: "approved" })
        .eq("id", redemption.id);

      if (updateError) throw updateError;

      // Deduct points from loyalty_accounts
      const { error: accountError } = await supabase
        .from("loyalty_accounts")
        .update({
          available_points: supabase.raw(`available_points - ${redemption.points_used}`),
          total_points: supabase.raw(`total_points - ${redemption.points_used}`),
        })
        .eq("id", redemption.account_id);

      if (accountError) throw accountError;

      // Insert transaction
      const { error: transactionError } = await supabase.from("loyalty_transactions").insert({
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customer_name: redemption.customer_name,
        phone: redemption.phone,
        type: "redeemed",
        source: "reward_redemption",
        points: -redemption.points_used,
        status: "completed",
        reason: `استهلاك مكافأة: ${redemption.reward_name}`,
        previous_balance: redemption.previous_balance,
        new_balance: redemption.previous_balance - redemption.points_used,
        employee: "System",
      });

      if (transactionError) throw transactionError;

      toast.success("تمت الموافقة على الطلب");
      onRefresh();
    } catch (err) {
      console.error("Error approving redemption:", err);
      toast.error("فشل الموافقة على الطلب");
    }
  };

  const handleCancel = async (redemption: any) => {
    try {
      const { error } = await supabase
        .from("loyalty_redemptions")
        .update({ status: "cancelled" })
        .eq("id", redemption.id);

      if (error) throw error;
      toast.success("تم إلغاء الطلب");
      onRefresh();
    } catch (err) {
      toast.error("فشل إلغاء الطلب");
    }
  };

  const handleRefund = async (redemption: any) => {
    try {
      // Update redemption status
      const { error: updateError } = await supabase
        .from("loyalty_redemptions")
        .update({ status: "refunded" })
        .eq("id", redemption.id);

      if (updateError) throw updateError;

      // Refund points to loyalty_accounts
      const { error: accountError } = await supabase
        .from("loyalty_accounts")
        .update({
          available_points: supabase.raw(`available_points + ${redemption.points_used}`),
          total_points: supabase.raw(`total_points + ${redemption.points_used}`),
        })
        .eq("id", redemption.account_id);

      if (accountError) throw accountError;

      // Insert transaction
      const { error: transactionError } = await supabase.from("loyalty_transactions").insert({
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customer_name: redemption.customer_name,
        phone: redemption.phone,
        type: "earned",
        source: "refund",
        points: redemption.points_used,
        status: "completed",
        reason: `استرداد مكافأة: ${redemption.reward_name}`,
        previous_balance: redemption.previous_balance,
        new_balance: redemption.previous_balance + redemption.points_used,
        employee: "System",
      });

      if (transactionError) throw transactionError;

      toast.success("تم استرداد النقاط");
      onRefresh();
    } catch (err) {
      console.error("Error refunding redemption:", err);
      toast.error("فشل استرداد النقاط");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "delivered":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      case "refunded":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
    }
  };

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

  const pendingRequests = redemptions.filter((r) => r.status === "pending").slice(0, 10);
  const allRequests = redemptions.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>طلبات استهلاك المكافآت</CardTitle>
      </CardHeader>
      <CardContent>
        {allRequests.length > 0 ? (
          <div className="space-y-3">
            {allRequests.map((redemption, index) => (
              <motion.div
                key={redemption.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{redemption.customer_name}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {redemption.phone}
                    </p>
                  </div>
                  <Badge className={getStatusColor(redemption.status)}>{redemption.status}</Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">المكافأة</p>
                    <p className="font-medium">{redemption.reward_name}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">النقاط المستهلكة</p>
                    <p className="font-bold">{redemption.points_used?.toLocaleString("ar-SA")}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{new Date(redemption.created_at).toLocaleDateString("ar-SA")}</span>
                  <span dir="ltr">{redemption.redemption_id}</span>
                </div>

                {redemption.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(redemption)}>
                      <Check className="size-3 ml-1" />
                      موافقة
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCancel(redemption)}>
                      <X className="size-3 ml-1" />
                      إلغاء
                    </Button>
                  </div>
                )}

                {redemption.status === "approved" && (
                  <Button size="sm" variant="outline" onClick={() => handleRefund(redemption)}>
                    <RotateCcw className="size-3 ml-1" />
                    استرداد النقاط
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-6 bg-muted rounded-full mb-4">
              <MoreHorizontal className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
            <p className="text-sm text-muted-foreground max-w-md">لم يتم تقديم طلبات استهلاك بعد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
