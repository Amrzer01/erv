"use client";

import { motion } from "framer-motion";
import { Award, Calendar, Coins, Crown, Gift, MessageSquare, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function RulesEngine() {
  const rules = [
    {
      name: "1 ريال = 1 نقطة",
      description: "كل ريال منفوق يكسب نقطة واحدة",
      icon: <Coins className="size-5" />,
      color: "from-blue-500 to-cyan-500",
      status: "active",
    },
    {
      name: "100 نقطة ترحيبية",
      description: "نقاط مجانية عند التسجيل لأول مرة",
      icon: <Gift className="size-5" />,
      color: "from-green-500 to-emerald-500",
      status: "active",
    },
    {
      name: "200 نقطة للإحالة",
      description: "نقاط عند إحالة عميل جديد",
      icon: <Star className="size-5" />,
      color: "from-purple-500 to-violet-500",
      status: "active",
    },
    {
      name: "مكافأة مراجعة Google",
      description: "نقاط إضافية عند كتابة مراجعة",
      icon: <MessageSquare className="size-5" />,
      color: "from-yellow-500 to-amber-500",
      status: "active",
    },
    {
      name: "مكافأة تذكير المراجعة",
      description: "نقاط عند الاستجابة للتذكير",
      icon: <Calendar className="size-5" />,
      color: "from-orange-500 to-red-500",
      status: "active",
    },
    {
      name: "نقاط مضاعفة Silver",
      description: "أعضاء Silver يحصلون على نقاط مضاعفة",
      icon: <Award className="size-5" />,
      color: "from-slate-400 to-slate-500",
      status: "active",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">قواعد اكتساب النقاط</h3>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
            >
              <div className={`p-3 bg-gradient-to-br ${rule.color} rounded-xl text-white`}>{rule.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{rule.name}</h4>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                  >
                    {rule.status === "active" ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
