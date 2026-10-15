"use client";

import { motion } from "framer-motion";
import { ArrowDown, Award, CheckCircle, Crown, Medal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function AutomaticUpgradeRules() {
  const rules = [
    {
      from: "Silver",
      to: "Gold",
      fromIcon: <Medal className="size-5" />,
      toIcon: <Award className="size-5" />,
      condition: "٣ رحلات خلال آخر ٦ أشهر",
      description: "يتم الترقية تلقائياً بعد إكمال ٣ حجوزات خلال آخر ٦ أشهر",
    },
    {
      from: "Gold",
      to: "Platinum",
      fromIcon: <Award className="size-5" />,
      toIcon: <Crown className="size-5" />,
      condition: "٥ رحلات أو أكثر + تقييم مرتفع",
      description: "يتم الترقية تلقائياً بعد إكمال ٥ حجوزات والحصول على تقييم مرتفع",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-6">قواعد الترقية التلقائية</h3>
        <div className="space-y-6">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.from}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-4"
            >
              {/* From Tier */}
              <div className="flex-1 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                <div className="flex justify-center mb-2 text-slate-500">{rule.fromIcon}</div>
                <p className="font-bold">{rule.from}</p>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-2">
                <ArrowDown className="size-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground max-w-32">{rule.condition}</p>
                </div>
              </div>

              {/* To Tier */}
              <div className="flex-1 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl text-center">
                <div className="flex justify-center mb-2 text-yellow-600 dark:text-yellow-400">{rule.toIcon}</div>
                <p className="font-bold">{rule.to}</p>
              </div>

              {/* Description */}
              <div className="flex-1 p-4 bg-muted rounded-xl">
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-sm">{rule.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
