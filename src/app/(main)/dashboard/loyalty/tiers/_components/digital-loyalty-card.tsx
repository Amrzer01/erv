"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { Award, Crown, Medal, QrCode } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import type { LoyaltyAccount } from "../../_components/types";

interface DigitalLoyaltyCardProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function DigitalLoyaltyCard({ accounts, loading }: DigitalLoyaltyCardProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const selectedCustomer = accounts.find((a) => a.id === selectedCustomerId) || accounts[0];

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return <Crown className="size-6" />;
      case "Gold":
        return <Medal className="size-6" />;
      case "Silver":
        return <Award className="size-6" />;
      default:
        return <Award className="size-6" />;
    }
  };

  const getTierGradient = (tier: string) => {
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

  const getDiscount = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "15%";
      case "Gold":
        return "10%";
      case "Silver":
        return "5%";
      default:
        return "5%";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${getTierGradient(selectedCustomer.loyalty_tier)} text-white shadow-2xl`}
          >
            {/* Card Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Card Content */}
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedCustomer.customer_name}</h3>
                  <p className="text-sm opacity-90" dir="ltr">
                    {selectedCustomer.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getTierIcon(selectedCustomer.loyalty_tier)}
                  <Badge className="bg-white/20 text-white border-white/30">{selectedCustomer.loyalty_tier}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs opacity-75">النقاط المتاحة</p>
                  <p className="text-2xl font-bold">{selectedCustomer.available_points.toLocaleString("ar-SA")}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">الخصم الحالي</p>
                  <p className="text-2xl font-bold">{getDiscount(selectedCustomer.loyalty_tier)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs opacity-75">الحجوزات</p>
                  <p className="text-lg font-semibold">{selectedCustomer.bookings_count}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">النقاط الكلية</p>
                  <p className="text-lg font-semibold">{selectedCustomer.total_points.toLocaleString("ar-SA")}</p>
                </div>
              </div>

              {/* QR Placeholder */}
              <div className="flex items-center justify-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-center">
                  <QrCode className="size-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs opacity-75">رمز QR</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
