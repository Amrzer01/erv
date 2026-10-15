"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { Calculator, Crown, Gift, Percent, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PointsCalculator() {
  const [points, setPoints] = useState<number>(500);
  const conversionRate = 0.1; // 1 point = 0.1 SAR (500 points = 50 SAR)

  const discount = points * conversionRate;
  const vipUpgrade = points >= 5000;
  const seasonalGift = points >= 3000;
  const remaining = points - (seasonalGift ? 3000 : 0) - (vipUpgrade ? 2000 : 0);

  const quickValues = [500, 1000, 1500, 3000, 5000];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="size-5" />
          حاسبة النقاط
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">أدخل النقاط</label>
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="text-2xl font-bold"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {quickValues.map((value) => (
            <Button key={value} variant="outline" size="sm" onClick={() => setPoints(value)}>
              {value}
            </Button>
          ))}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-blue-500" />
              <span className="text-sm">الخصم</span>
            </div>
            <span className="font-bold">{discount.toFixed(2)} ريال</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-purple-500" />
              <span className="text-sm">ترقية VIP</span>
            </div>
            <Badge variant={vipUpgrade ? "default" : "outline"}>{vipUpgrade ? "متاح" : "غير متاح"}</Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Gift className="size-4 text-green-500" />
              <span className="text-sm">هدية موسمية</span>
            </div>
            <Badge variant={seasonalGift ? "default" : "outline"}>{seasonalGift ? "متاح" : "غير متاح"}</Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-orange-500" />
              <span className="text-sm">الرصيد المتبقي</span>
            </div>
            <span className="font-bold">{remaining.toLocaleString("ar-SA")} نقطة</span>
          </motion.div>
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            سعر التحويل الحالي: <span className="font-bold">500 نقطة = 50 ريال</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
