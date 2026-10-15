"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Badge, Bell, CreditCard, LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";

export function AccountSwitcher() {
  const router = useRouter();
  const supabase = createClient();
  const { currentEmployee, currentUser, isAdmin, refreshEmployee } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("فشل تسجيل الخروج");
    }
  };

  if (!currentEmployee || !currentUser) {
    return null;
  }

  const user = {
    name: currentEmployee.full_name,
    email: currentEmployee.email,
    avatar: currentEmployee.avatar_url || currentUser.user_metadata.avatar_url || "",
    role: isAdmin ? "مسؤول النظام" : currentEmployee.role || "موظف",
    department: currentEmployee.department || "غير محدد",
    status: currentEmployee.status === "active" ? "نشط" : "غير نشط",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 rounded-lg cursor-pointer">
          <AvatarImage src={user.avatar || undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <div className="px-2 py-1.5">
          <p className="truncate font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {user.email}
          </p>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">القسم</span>
            <span className="font-medium">{user.department}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">المسمى</span>
            <span className="font-medium">{user.role}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">الحالة</span>
            <span className={`font-medium ${user.status === "نشط" ? "text-green-500" : "text-red-500"}`}>
              {user.status}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="ml-2 size-4" />
            الملف الشخصي
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="ml-2 size-4" />
            الإعدادات
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/notifications")}>
            <Bell className="ml-2 size-4" />
            الإشعارات
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
          <LogOut className="ml-2 size-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
