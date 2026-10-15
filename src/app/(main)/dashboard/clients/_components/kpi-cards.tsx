import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { KpiData } from "./types";
import { formatMoney } from "./utils";

interface KpiCardsProps {
  kpiData: KpiData;
}

export function KpiCards({ kpiData }: KpiCardsProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="grid grid-cols-1 xl:grid-cols-12">
        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-3 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">إجمالي العملاء</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-3xl leading-none tracking-tight">
                {kpiData.totalCustomers.toLocaleString("ar-SA")}
              </div>
              <p className="text-muted-foreground text-xs">عملاء فريدين</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-3 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">إجمالي الحجوزات</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl leading-none tracking-tight">
                {kpiData.totalBookings.toLocaleString("ar-SA")}
              </div>
              <p className="text-muted-foreground text-xs">حجز إجمالي</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 border-foreground/10 border-b ring-0 xl:col-span-3 xl:border-r">
          <CardHeader>
            <CardTitle className="font-normal">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl leading-none tracking-tight">{formatMoney(kpiData.totalRevenue)}</div>
              <p className="text-muted-foreground text-xs">إيرادات إجمالية</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-5 overflow-hidden rounded-none border-0 ring-0 xl:col-span-3">
          <CardHeader>
            <CardTitle className="font-normal">متوسط قيمة الحجز</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-3xl leading-none tracking-tight">{formatMoney(kpiData.averageBookingValue)}</div>
              <p className="text-muted-foreground text-xs">متوسط لكل حجز</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
