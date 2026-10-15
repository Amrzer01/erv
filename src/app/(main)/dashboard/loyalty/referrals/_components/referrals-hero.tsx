"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface ReferralsHeroProps {
  referralsCount?: number;
  completedCount?: number;
}

export function ReferralsHero({ referralsCount = 0, completedCount = 0 }: ReferralsHeroProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          الإحالات
        </h1>
        <p className="text-muted-foreground">
          هذا القسم يتيح متابعة جميع الإحالات بين العملاء، مراقبة أداء برنامج الإحالة، ومنح نقاط المكافآت تلقائياً.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
            إجمالي الإحالات: {referralsCount}
          </Badge>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            المكتملة: {completedCount}
          </Badge>
        </div>
      </div>

      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="hidden md:block"
      >
        <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl">
          <Users className="size-16 text-white" />
        </div>
      </motion.div>
    </div>
  );
}
