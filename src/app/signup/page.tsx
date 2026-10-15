"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import { Globe, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create employee record
      if (data.user) {
        const { error: employeeError } = await supabase.from("employees").insert({
          auth_user_id: data.user.id,
          full_name: fullName,
          email: email,
          avatar_url: data.user.user_metadata.avatar_url || null,
          status: "pending", // Will be updated to active if first user
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (employeeError) throw employeeError;
      }

      toast.success("تم إنشاء الحساب بنجاح");

      // Check if this is the first user to determine redirect
      const { count } = await supabase.from("employees").select("*", { count: "exact", head: true });

      if (count === 1) {
        // First user - make them admin and redirect to clients
        await supabase
          .from("employees")
          .update({ status: "active", is_super_admin: true })
          .eq("auth_user_id", data.user.id);

        router.push("/dashboard/clients");
      } else {
        // Subsequent user - redirect to pending approval
        router.push("/pending-approval");
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "فشل إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?signup=true`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "فشل التسجيل بـ Google");
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
            <CardTitle className="text-2xl font-bold text-white">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-slate-400">أدخل بياناتك لإنشاء حساب في النظام</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full bg-white text-slate-900 hover:bg-slate-100"
              variant="outline"
            >
              {loading ? <Loader2 className="ml-2 size-4 animate-spin" /> : <Globe className="ml-2 size-4" />}
              التسجيل بـ Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">أو</span>
              </div>
            </div>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="الاسم الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

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
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  تأكيد كلمة المرور
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {loading ? <Loader2 className="ml-2 size-4 animate-spin" /> : "إنشاء الحساب"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              لديك حساب بالفعل؟{" "}
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                تسجيل الدخول
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
