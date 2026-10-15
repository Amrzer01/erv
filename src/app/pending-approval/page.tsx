"use client";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { Clock, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-orange-500/20 rounded-full">
                <Clock className="size-12 text-orange-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">حسابك بانتظار الموافقة</CardTitle>
            <CardDescription className="text-slate-400">
              تم إنشاء حسابك بنجاح وهو بانتظار موافقة الإدارة
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-slate-300">سيتم إشعارك عبر البريد الإلكتروني عند تفعيل حسابك</p>
              <p className="text-sm text-slate-400">إذا كانت لديك أي استفسارات، يمكنك التواصل مع المسؤول</p>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <LogOut className="ml-2 size-4" />
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
