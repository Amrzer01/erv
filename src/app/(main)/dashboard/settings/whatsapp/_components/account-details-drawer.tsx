"use client";

import { Calendar, Clock, Copy, Shield, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import type { Account } from "./types";
import { formatDateTime, getStatusBadgeVariant, getStatusLabel } from "./utils";

interface AccountDetailsDrawerProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailsDrawer({ account, open, onOpenChange }: AccountDetailsDrawerProps) {
  if (!account) return null;

  const handleCopySafeId = () => {
    navigator.clipboard.writeText(account.safe_id);
    toast.success("تم نسخ Safe ID");
  };

  const initials = account.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[500px] md:w-[600px] overflow-y-auto" dir="rtl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">تفاصيل الحساب</SheetTitle>
            <SheetClose asChild>
              <Button size="icon" variant="ghost">
                <X className="size-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Header with Avatar */}
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-semibold">{account.display_name}</h3>
                <p className="text-muted-foreground font-mono text-sm" dir="ltr">
                  {account.safe_id}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(account.status)} className="font-medium">
                {getStatusLabel(account.status)}
              </Badge>
            </div>
          </div>

          {/* Copy Safe ID */}
          <Button onClick={handleCopySafeId} variant="outline" className="w-full gap-2">
            <Copy className="size-4" />
            نسخ Safe ID
          </Button>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="size-4" />
                <span>Safe ID</span>
              </div>
              <div className="font-medium font-mono text-sm" dir="ltr">
                {account.safe_id}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>تاريخ الإنشاء</span>
              </div>
              <div className="font-medium">{formatDateTime(account.created_at)}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>آخر تحديث</span>
              </div>
              <div className="font-medium">{formatDateTime(account.updated_at)}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">معرف الحساب</span>
              <span className="font-mono text-sm" dir="ltr">
                {account.id}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
