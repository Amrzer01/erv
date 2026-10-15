"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if employee row exists
        const { data: existing } = await supabase
          .from("employees")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("employees")
            .update({ status: "active", is_super_admin: true, updated_at: new Date().toISOString() })
            .eq("auth_user_id", user.id);
        } else {
          await supabase.from("employees").insert({
            auth_user_id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || "Admin",
            status: "active",
            is_super_admin: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        toast.success("تم تفعيل حسابك كمسؤول بنجاح!");
        router.push("/dashboard/clients");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Activation error:", err);
      toast.error(err.message || "حدث خطأ أثناء التفعيل");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <ShieldCheck className="size-12 text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">تفعيل الحساب الإداري</CardTitle>
            <CardDescription className="text-slate-400">
              يمكنك الآن تفعيل حسابك مباشرة للدخول إلى لوحة التحكم بصلاحيات المسؤول الكاملة
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              onClick={handleActivate}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 size-4 animate-spin" />
                  جاري تفعيل الحساب...
                </>
              ) : (
                <>
                  <CheckCircle2 className="ml-2 size-4" />
                  تفعيل الحساب والدخول كمسؤول الآن
                </>
              )}
            </Button>

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
