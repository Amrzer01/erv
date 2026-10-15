"use client";

import { motion } from "framer-motion";
import { ArrowDown, Award, Crown, Medal } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function TierRequirementsTimeline() {
  const tiers = [
    {
      name: "Silver",
      arabic: "فضي",
      icon: <Medal className="size-6" />,
      color: "from-slate-400 to-slate-500",
      requirement: "أول حجز",
      benefits: ["خصم 5%", "نقاط مضاعفة لأول رحلة"],
    },
    {
      name: "Gold",
      arabic: "ذهبي",
      icon: <Award className="size-6" />,
      color: "from-yellow-400 to-yellow-500",
      requirement: "٣ رحلات خلال آخر ٦ أشهر",
      benefits: ["خصم 10%", "خدمة عملاء مخصصة"],
    },
    {
      name: "Platinum",
      arabic: "بلاتيني",
      icon: <Crown className="size-6" />,
      color: "from-purple-500 to-emerald-500",
      requirement: "٥ رحلات أو أكثر + تقييم مرتفع",
      benefits: ["رحلة VIP مجانية سنوياً", "هدية مميزة"],
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-6">مسار الترقيات</h3>
        <div className="flex items-center justify-between gap-4">
          {tiers.map((tier, index) => (
            <div key={tier.name} className="flex-1">
              {/* Tier Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`p-4 rounded-xl bg-gradient-to-br ${tier.color} text-white text-center`}
              >
                <div className="flex justify-center mb-2">{tier.icon}</div>
                <h4 className="font-bold">{tier.name}</h4>
                <p className="text-sm opacity-90 mb-2">{tier.arabic}</p>
                <p className="text-xs opacity-75 mb-3">{tier.requirement}</p>
                <div className="space-y-1">
                  {tier.benefits.map((benefit, i) => (
                    <p key={i} className="text-xs opacity-90">
                      • {benefit}
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* Arrow */}
              {index < tiers.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className="size-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
