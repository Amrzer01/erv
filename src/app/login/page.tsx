"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { Globe, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/dashboard/clients");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("[OAUTH] redirectTo:", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      console.log("[OAUTH] authorization URL:", data?.url);
      console.log("[OAUTH] error:", error);

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "فشل تسجيل الدخول بـ Google");
      setLoading(false);
    }
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
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-white">تسجيل الدخول</CardTitle>
            <CardDescription className="text-slate-400">أدخل بياناتك للوصول إلى النظام</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-slate-900 hover:bg-slate-100"
              variant="outline"
            >
              {loading ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Globe className="ml-2 size-4" />}
              المتابعة بـ Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">أو</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <a href="/forgot-password" className="text-slate-400 hover:text-white transition-colors">
                  نسيت كلمة المرور؟
                </a>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {loading ? <Loader2 className="ml-2 size-4 animate-spin" /> : "تسجيل الدخول"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              ليس لديك حساب؟{" "}
              <a href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                إنشاء حساب جديد
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
