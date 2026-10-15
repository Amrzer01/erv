"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface PointsHeroProps {
  accountsCount: number;
  transactionsCount: number;
}

export function PointsHero({ accountsCount, transactionsCount }: PointsHeroProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          النقاط
        </h1>
        <p className="text-muted-foreground">
          إدارة جميع نقاط برنامج الولاء وسجل الحركات والتحويلات والمكافآت في مكان واحد.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            عدد الحسابات: {accountsCount}
          </Badge>
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
            إجمالي الحركات: {transactionsCount}
          </Badge>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            آخر تحديث: الآن
          </Badge>
        </div>
      </div>

      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="hidden md:block"
      >
        <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-2xl">
          <Coins className="size-16 text-white" />
        </div>
      </motion.div>
    </div>
  );
}
