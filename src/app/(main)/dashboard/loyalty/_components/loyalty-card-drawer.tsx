"use client";

import { Award, Calendar, CreditCard, Crown, Gift, Medal, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import type { LoyaltyAccount, LoyaltyTier } from "./types";

interface LoyaltyCardDrawerProps {
  account: LoyaltyAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoyaltyCardDrawer({ account, open, onOpenChange }: LoyaltyCardDrawerProps) {
  if (!account) return null;

  const getTierIcon = (tier: LoyaltyTier) => {
    switch (tier) {
      case "Platinum":
        return <Crown className="size-6 text-amber-500" />;
      case "Gold":
        return <Medal className="size-6 text-yellow-500" />;
      case "Silver":
        return <Award className="size-6 text-gray-400" />;
    }
  };

  const getTierGradient = (tier: LoyaltyTier) => {
    switch (tier) {
      case "Platinum":
        return "from-amber-500 to-amber-600";
      case "Gold":
        return "from-yellow-500 to-yellow-600";
      case "Silver":
        return "from-gray-400 to-gray-500";
    }
  };

  const getTierProgress = (tier: LoyaltyTier, bookingsCount: number) => {
    switch (tier) {
      case "Silver":
        return { current: bookingsCount, target: 3, nextTier: "Gold" };
      case "Gold":
        return { current: bookingsCount, target: 5, nextTier: "Platinum" };
      case "Platinum":
        return { current: bookingsCount, target: bookingsCount, nextTier: null };
    }
  };

  const tierProgress = getTierProgress(account.loyalty_tier, account.bookings_count);
  const progressPercent = tierProgress.nextTier ? (tierProgress.current / tierProgress.target) * 100 : 100;

  const rewards = [
    { name: "خصم نقدي", icon: <CreditCard className="size-4" />, available: true },
    {
      name: "ترقية VIP",
      icon: <Star className="size-4" />,
      available: account.loyalty_tier === "Gold" || account.loyalty_tier === "Platinum",
    },
    { name: "هدايا موسمية", icon: <Gift className="size-4" />, available: account.loyalty_tier === "Platinum" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[500px] overflow-y-auto" dir="rtl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl">بطاقة الولاء</SheetTitle>
              <SheetDescription>{account.customer_name}</SheetDescription>
            </div>
            <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Loyalty Card */}
        <div
          className={`bg-gradient-to-br ${getTierGradient(account.loyalty_tier)} rounded-2xl p-6 text-white mb-6 shadow-xl`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTierIcon(account.loyalty_tier)}
              <div>
                <h3 className="text-xl font-bold">{account.loyalty_tier}</h3>
                <p className="text-sm opacity-90">عضو ولاء</p>
              </div>
            </div>
            {account.monthly_winner && <Badge className="bg-white text-amber-600">الفائز الشهري</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm opacity-75">النقاط المتاحة</p>
              <p className="text-2xl font-bold">{account.available_points.toLocaleString("ar-SA")}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">النقاط الكلية</p>
              <p className="text-2xl font-bold">{account.total_points.toLocaleString("ar-SA")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm opacity-75">الحجوزات</p>
              <p className="text-lg font-semibold">{account.bookings_count}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">الإنفاق الكلي</p>
              <p className="text-lg font-semibold">{account.total_spent.toLocaleString("ar-SA")} SAR</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tierProgress.nextTier && (
          <div className="bg-muted rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">التقدم نحو {tierProgress.nextTier}</h4>
              <span className="text-sm text-muted-foreground">
                {tierProgress.current} / {tierProgress.target} حجوزات
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              تحتاج {tierProgress.target - tierProgress.current} حجوزات إضافية للترقية
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">النقاط المستهلكة</span>
            </div>
            <p className="text-xl font-bold">{account.spent_points.toLocaleString("ar-SA")}</p>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">عدد الإحالات</span>
            </div>
            <p className="text-xl font-bold">{account.referral_count || 0}</p>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">مكافأة الترحيب</span>
            </div>
            <p className="text-xl font-bold">{account.welcome_bonus || 0}</p>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">مكافأة التقييم</span>
            </div>
            <p className="text-xl font-bold">{account.google_review_bonus || 0}</p>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">المكافآت المتاحة</h4>
          <div className="space-y-2">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  reward.available ? "bg-white" : "bg-muted opacity-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${reward.available ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                  {reward.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">{reward.available ? "متاح" : "غير متاح"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">آخر رحلة:</span>
            <span className="font-medium">
              {account.last_trip_date ? new Date(account.last_trip_date).toLocaleDateString("ar-SA") : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">آخر نشاط:</span>
            <span className="font-medium">{new Date(account.last_activity_at).toLocaleDateString("ar-SA")}</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
