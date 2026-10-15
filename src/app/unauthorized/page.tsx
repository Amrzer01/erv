"use client";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { LogIn, ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Error Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="backdrop-blur-xl bg-slate-900/80 border-slate-700/50 rounded-2xl shadow-2xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto mb-6"
          >
            <div className="p-6 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
              <ShieldX className="size-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-2">غير مصرح</h1>

          <p className="text-slate-400 mb-6">
            ليس لديك الصلاحية للوصول إلى هذه الصفحة. يرجى التواصل مع المسؤول للحصول على الصلاحيات المطلوبة.
          </p>

          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <LogIn className="ml-2 size-4" />
            العودة للرئيسية
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
