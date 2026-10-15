"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { ArrowDown, Calendar, CheckCircle, Edit3, Gift, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { LoyaltyAccount } from "../../_components/types";

interface CustomerJourneyProps {
  accounts: LoyaltyAccount[];
}

export function CustomerJourney({ accounts }: CustomerJourneyProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const selectedCustomer = accounts.find((a) => a.id === selectedCustomerId) || accounts[0];

  // Mock journey events - in real implementation, this would come from transactions
  const journeyEvents = selectedCustomer
    ? [
        {
          type: "booking",
          title: "حجز جديد",
          description: "حجز رحلة عمرة",
          points: 1000,
          date: "2024-01-15",
          icon: <Calendar className="size-4" />,
          color: "from-blue-500 to-cyan-500",
        },
        {
          type: "earned",
          title: "اكتساب نقاط",
          description: "نقاط من الحجز",
          points: 1000,
          date: "2024-01-15",
          icon: <Gift className="size-4" />,
          color: "from-green-500 to-emerald-500",
        },
        {
          type: "referral",
          title: "إحالة",
          description: "إحالة عميل جديد",
          points: 200,
          date: "2024-02-01",
          icon: <Gift className="size-4" />,
          color: "from-purple-500 to-violet-500",
        },
        {
          type: "redeemed",
          title: "استهلاك نقاط",
          description: "خصم على حجز",
          points: -500,
          date: "2024-02-10",
          icon: <Wallet className="size-4" />,
          color: "from-red-500 to-rose-500",
        },
        {
          type: "manual",
          title: "تعديل يدوي",
          description: "مكافأة خاصة",
          points: 100,
          date: "2024-02-15",
          icon: <Edit3 className="size-4" />,
          color: "from-orange-500 to-amber-500",
        },
      ]
    : [];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">اختر العميل</label>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر عميلاً" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.customer_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCustomer && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{selectedCustomer.customer_name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{selectedCustomer.available_points.toLocaleString("ar-SA")}</p>
                  <p className="text-xs text-muted-foreground">الرصيد الحالي</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {journeyEvents.map((event, index) => (
                <div key={index} className="relative">
                  {index < journeyEvents.length - 1 && (
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
                        <span className={`text-sm font-bold ${event.points > 0 ? "text-green-600" : "text-red-600"}`}>
                          {event.points > 0 ? "+" : ""}
                          {event.points.toLocaleString("ar-SA")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
