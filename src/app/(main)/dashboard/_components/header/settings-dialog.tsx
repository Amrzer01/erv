"use client";

import { useRouter } from "next/navigation";

import { Bell, Bot, Briefcase, Building2, Key, Lock, Settings as SettingsIcon, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SETTINGS_ITEMS = [
  {
    id: "users",
    title: "المستخدمون",
    description: "إدارة الموظفين وحسابات الوصول والصلاحيات",
    icon: Users,
    url: "/dashboard/users",
    badge: null,
  },
  {
    id: "permissions",
    title: "الصلاحيات",
    description: "إدارة صلاحيات النظام والأدوار",
    icon: Lock,
    url: "/dashboard/coming-soon",
    badge: "قريباً",
  },
  {
    id: "branches",
    title: "الفروع",
    description: "إدارة فروع الشركة",
    icon: Building2,
    url: "/dashboard/coming-soon",
    badge: "قريباً",
  },
  {
    id: "departments",
    title: "الأقسام",
    description: "إدارة الأقسام في النظام",
    icon: Briefcase,
    url: "/dashboard/departments",
    badge: null,
  },
  {
    id: "notifications",
    title: "الإشعارات",
    description: "إعدادات الإشعارات والتنبيهات",
    icon: Bell,
    url: "/dashboard/coming-soon",
    badge: "قريباً",
  },
  {
    id: "ai",
    title: "إعدادات الذكاء الاصطناعي",
    description: "تكوين WhatsApp AI والمساعد الذكي",
    icon: Bot,
    url: "/dashboard/settings/whatsapp",
    badge: null,
  },
  {
    id: "api",
    title: "API",
    description: "إدارة مفاتيح API والتكاملات",
    icon: Key,
    url: "/dashboard/coming-soon",
    badge: "قريباً",
  },
  {
    id: "system",
    title: "النظام",
    description: "إعدادات النظام والتكوين العام",
    icon: SettingsIcon,
    url: "/dashboard/coming-soon",
    badge: "قريباً",
  },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const router = useRouter();

  const handleNavigate = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto sm:max-w-5xl sm:rounded-lg rounded-none h-full w-full sm:h-auto sm:w-full">
        <DialogHeader className="gap-2 pr-8">
          <DialogTitle>الإعدادات</DialogTitle>
          <DialogDescription>إدارة إعدادات النظام والتكوينات المختلفة</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-4">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleNavigate(item.url)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </div>
                    </div>
                    {item.badge && (
                      <Badge variant="outline" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
