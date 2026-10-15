"use client";

import { motion } from "framer-motion";
import { Award, Calendar, Clock, MapPin, Phone, Plane, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CustomerProfileDrawerProps {
  customer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerProfileDrawer({ customer, open, onOpenChange }: CustomerProfileDrawerProps) {
  if (!customer) return null;

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>ملف العميل</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Digital Loyalty Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`bg-gradient-to-br ${getTierColor(customer.loyalty_tier)} text-white border-0`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm opacity-80">بطاقة الولاء</p>
                    <p className="text-2xl font-bold">{customer.customer_name}</p>
                  </div>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {customer.loyalty_tier}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-80">النقاط المتاحة</p>
                    <p className="text-2xl font-bold">{customer.available_points?.toLocaleString("ar-SA")}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">إجمالي النقاط</p>
                    <p className="text-2xl font-bold">{customer.total_points?.toLocaleString("ar-SA")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">معلومات العميل</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{customer.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-medium" dir="ltr">
                    {customer.phone}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loyalty Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">إحصائيات الولاء</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-muted-foreground" />
                  <span className="text-sm">المستوى</span>
                </div>
                <Badge variant="outline">{customer.loyalty_tier}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-muted-foreground" />
                  <span className="text-sm">النقاط المتاحة</span>
                </div>
                <span className="font-bold">{customer.available_points?.toLocaleString("ar-SA")}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-muted-foreground" />
                  <span className="text-sm">إجمالي النقاط</span>
                </div>
                <span className="font-bold">{customer.total_points?.toLocaleString("ar-SA")}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-muted-foreground" />
                  <span className="text-sm">عدد الحجوزات</span>
                </div>
                <span className="font-bold">{customer.booking_count?.toLocaleString("ar-SA") || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-muted-foreground" />
                  <span className="text-sm">عدد الإحالات</span>
                </div>
                <span className="font-bold">{customer.referral_count?.toLocaleString("ar-SA") || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">النشاط</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">آخر نشاط</p>
                  <p className="font-medium">
                    {customer.last_activity
                      ? new Date(customer.last_activity).toLocaleDateString("ar-SA")
                      : "غير متوفر"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                  <p className="font-medium">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString("ar-SA") : "غير متوفر"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
