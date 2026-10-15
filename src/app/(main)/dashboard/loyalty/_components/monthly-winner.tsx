"use client";

import { useEffect, useState } from "react";

import { Crown, Phone, Sparkles, Trophy, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount } from "./types";

interface MonthlyWinnerProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
}

export function MonthlyWinner({ accounts, loading }: MonthlyWinnerProps) {
  const [currentWinner, setCurrentWinner] = useState<LoyaltyAccount | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchCurrentWinner = async () => {
      if (loading) return;

      try {
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Check if there's already a winner for this month
        const { data: winner } = await supabase
          .from("loyalty_accounts")
          .select("*")
          .eq("monthly_winner", true)
          .single();

        if (winner) {
          setCurrentWinner(winner);
        }
      } catch (err) {
        console.error("Error fetching winner:", err);
      }
    };

    fetchCurrentWinner();
  }, [accounts, loading]);

  const handleDrawWinner = async () => {
    try {
      setIsDrawing(true);

      // Filter eligible customers (not already winner this month)
      const eligibleCustomers = accounts.filter((acc) => !acc.monthly_winner);

      if (eligibleCustomers.length === 0) {
        toast.error("لا يوجد عملاء مؤهلين للسحب");
        setIsDrawing(false);
        return;
      }

      // Simulate drawing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Randomly select a winner
      const randomIndex = Math.floor(Math.random() * eligibleCustomers.length);
      const winner = eligibleCustomers[randomIndex];

      // Update the winner in database
      const { error } = await supabase.from("loyalty_accounts").update({ monthly_winner: true }).eq("id", winner.id);

      if (error) throw error;

      setCurrentWinner(winner);
      setShowConfetti(true);
      toast.success(`تهانينا للفائز ${winner.customer_name}!`);

      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      console.error("Error drawing winner:", err);
      toast.error("فشل سحب الفائز");
    } finally {
      setIsDrawing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden ${showConfetti ? "ring-4 ring-amber-500" : ""}`}>
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"][i % 5],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" />
          الفائز الشهري
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentWinner ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="size-24 ring-4 ring-amber-500 ring-offset-2">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-2xl">
                  {currentWinner.customer_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
                <Crown className="size-4 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-1">{currentWinner.customer_name}</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                <Phone className="size-4" />
                <span dir="ltr">{currentWinner.phone}</span>
              </div>
              <Badge className="bg-amber-500 hover:bg-amber-600">{currentWinner.loyalty_tier}</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t">
              <div>
                <p className="text-2xl font-bold">{currentWinner.bookings_count}</p>
                <p className="text-xs text-muted-foreground">حجوزات</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{currentWinner.total_spent.toLocaleString("ar-SA")}</p>
                <p className="text-xs text-muted-foreground">إنفاق (SAR)</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{currentWinner.total_points.toLocaleString("ar-SA")}</p>
                <p className="text-xs text-muted-foreground">نقاط</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-600">
              <Sparkles className="size-4" />
              <span>تهانينا! جائزة شهرية خاصة</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="p-4 bg-amber-100 rounded-full">
              <Trophy className="size-12 text-amber-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">سحب الفائز الشهري</h3>
              <p className="text-sm text-muted-foreground mb-4">اختر فائزاً عشوائياً من أعضاء الولاء</p>
            </div>
            <Button
              onClick={handleDrawWinner}
              disabled={isDrawing || accounts.length === 0}
              size="lg"
              className="gap-2"
            >
              {isDrawing ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري السحب...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  سحب الفائز
                </>
              )}
            </Button>
            {accounts.length === 0 && <p className="text-xs text-muted-foreground">لا يوجد أعضاء مؤهلين للسحب</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
