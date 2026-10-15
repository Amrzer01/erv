"use client";

import { motion } from "framer-motion";
import { ArrowDown, Award, Calendar, CheckCircle, Clock, Phone, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ReferralDetailsDrawerProps {
  referral: any;
  account: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferralDetailsDrawer({ referral, account, open, onOpenChange }: ReferralDetailsDrawerProps) {
  if (!referral) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
    }
  };

  const timelineEvents = [
    {
      title: "إنشاء الإحالة",
      date: referral.created_at,
      icon: <User className="size-4" />,
      color: "from-blue-500 to-cyan-500",
    },
    ...(referral.booking_completed
      ? [
          {
            title: "إكمال الحجز",
            date: referral.updated_at,
            icon: <CheckCircle className="size-4" />,
            color: "from-green-500 to-emerald-500",
          },
        ]
      : []),
    ...(referral.rewarded
      ? [
          {
            title: "منح المكافأة",
            date: referral.rewarded_at,
            icon: <Award className="size-4" />,
            color: "from-purple-500 to-violet-500",
          },
        ]
      : []),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>تفاصيل الإحالة</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Referral Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground" dir="ltr">
                  {referral.id}
                </span>
              </div>
              <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
            </div>
            <div className="text-3xl font-bold mb-2">{referral.referrer_name}</div>
            <p className="text-sm text-muted-foreground" dir="ltr">
              {referral.referrer_phone}
            </p>
          </motion.div>

          {/* Referrer Info */}
          {account && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h4 className="font-semibold">معلومات المحيل</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-medium">{account.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-medium" dir="ltr">
                      {account.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" />
                    <span className="text-sm">المستوى</span>
                  </div>
                  <Badge variant="outline">{account.loyalty_tier}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" />
                    <span className="text-sm">النقاط المتاحة</span>
                  </div>
                  <span className="font-bold">{account.available_points?.toLocaleString("ar-SA")}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" />
                    <span className="text-sm">إجمالي الإحالات</span>
                  </div>
                  <span className="font-bold">{account.referral_count?.toLocaleString("ar-SA")}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Referred Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">المحال إليه</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-medium" dir="ltr">
                    {referral.referred_phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">حالة الحجز</p>
                  <Badge className={getStatusColor(referral.status)}>
                    {referral.booking_completed ? "مكتمل" : "غير مكتمل"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Award className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">حالة المكافأة</p>
                  <Badge variant={referral.rewarded ? "default" : "outline"}>
                    {referral.rewarded ? "ممنوحة" : "غير ممنوحة"}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">الجدول الزمني</h4>
            <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative">
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute right-6 top-12 bottom-0 w-0.5 bg-border" />
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className={`p-2 bg-gradient-to-br ${event.color} rounded-full text-white shrink-0`}>
                      {event.icon}
                    </div>

                    <div className="flex-1 p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
