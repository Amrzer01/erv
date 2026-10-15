"use client";

import { CreditCard, Gift, Package, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RewardsAnalytics() {
  // Since we don't have a rewards redemption table yet, display a placeholder
  // The UI is designed to automatically work once a future rewards table is added

  const rewards = [
    {
      name: "خصم نقدي",
      icon: <CreditCard className="size-5" />,
      description: "خصم على الحجوزات المستقبلية",
      status: "available",
    },
    {
      name: "ترقية VIP",
      icon: <Star className="size-5" />,
      description: "خدمات VIP حصرية",
      status: "available",
    },
    {
      name: "هدايا موسمية",
      icon: <Package className="size-5" />,
      description: "هدايا خاصة بالأعياد",
      status: "available",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="size-5 text-pink-500" />
          تحليلات المكافآت
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Redemption History Placeholder */}
          <div className="p-6 border border-dashed rounded-xl text-center">
            <Gift className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">لا توجد عمليات استبدال بعد</h3>
            <p className="text-sm text-muted-foreground mb-4">
              سيظهر هنا تاريخ استبدال المكافآت بمجرد إضافة جدول المكافآت
            </p>
            <Badge variant="outline" className="mx-auto">
              بانتظار جدول المكافآت
            </Badge>
          </div>

          {/* Available Rewards Preview */}
          <div>
            <h4 className="font-semibold mb-3">المكافآت المتاحة</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rewards.map((reward, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">{reward.icon}</div>
                    <div>
                      <h5 className="font-medium">{reward.name}</h5>
                      <p className="text-xs text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    متاح
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Placeholder */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">عمليات الاستبدال</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">النقاط المستهلكة</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">قيمة المكافآت</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
