"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface RewardsHeroProps {
  rewardsCount?: number;
  partnersCount?: number;
}

export function RewardsHero({ rewardsCount = 0, partnersCount = 0 }: RewardsHeroProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          المكافآت
        </h1>
        <p className="text-muted-foreground">
          مركز إدارة المكافآت الشامل - إنشاء وتعديل وإدارة جميع مكافآت برنامج الولاء في مكان واحد.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
            المكافآت النشطة: {rewardsCount}
          </Badge>
          <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300">
            الشركاء: {partnersCount}
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
        <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl">
          <Gift className="size-16 text-white" />
        </div>
      </motion.div>
    </div>
  );
}
