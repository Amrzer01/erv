"use client";

import { Calendar, CheckCircle2, Clock, Copy, MessageCircle, Phone, TrendingUp, User, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { AiSummaryCard } from "./ai-summary-card";
import { ConversationTimeline } from "./conversation-timeline";
import { FollowUpStatusBadge } from "./follow-up-status-badge";
import type { PotentialClient } from "./types";
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  generateTimeline,
  getFollowUpStatus,
  getProbabilityBadgeColor,
  getProbabilityColor,
} from "./utils";

interface LeadDetailsDrawerProps {
  lead: PotentialClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailsDrawer({ lead, open, onOpenChange }: LeadDetailsDrawerProps) {
  if (!lead) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(lead.phone);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${lead.phone}`, "_blank");
  };

  const timeline = generateTimeline(lead);
  const initials = lead.customer_name
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
            <SheetTitle className="text-2xl font-bold">تفاصيل العميل المحتمل</SheetTitle>
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
              <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-semibold">{lead.customer_name}</h3>
                <p className="text-muted-foreground" dir="ltr">
                  {lead.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getProbabilityBadgeColor(lead.booking_probability)} className="font-medium">
                  احتمال الحجز: {lead.booking_probability}%
                </Badge>
                <Badge variant="outline">{lead.stage}</Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleCopyPhone} variant="outline" className="flex-1 gap-2">
              <Phone className="size-4" />
              نسخ الهاتف
            </Button>
            <Button onClick={handleWhatsApp} variant="outline" className="flex-1 gap-2">
              <MessageCircle className="size-4" />
              واتساب
            </Button>
          </div>

          {/* Follow-up Status Badge */}
          <FollowUpStatusBadge lead={lead} />

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4" />
                <span>فئة الحجز</span>
              </div>
              <div className="font-medium">{lead.booking_category || "غير محدد"}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4" />
                <span>عدد الركاب المتوقع</span>
              </div>
              <div className="font-medium">{lead.expected_passengers || "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>الرحلة المتوقعة</span>
              </div>
              <div className="font-medium">{lead.expected_trip_date ? formatDate(lead.expected_trip_date) : "-"}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="size-4" />
                <span>الحالة</span>
              </div>
              <div className="font-medium">{lead.status}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>عدد المتابعات</span>
              </div>
              <div className="font-medium">{lead.follow_up_count}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4" />
                <span>آخر نشاط</span>
              </div>
              <div className="font-medium">{lead.last_message_at ? formatRelativeTime(lead.last_message_at) : "-"}</div>
            </div>
          </div>

          {/* AI Summary Card */}
          {lead.summary && <AiSummaryCard summary={lead.summary} />}

          {/* Last Message */}
          {lead.last_message && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">آخر رسالة</h4>
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">{lead.last_message}</div>
              <div className="text-xs text-muted-foreground">
                {lead.last_message_at ? formatDateTime(lead.last_message_at) : ""}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">سجل المحادثة</h4>
            <ConversationTimeline timeline={timeline} />
          </div>

          {/* Timestamps */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">تم الإنشاء</span>
              <span>{formatDateTime(lead.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">آخر تحديث</span>
              <span>{formatDateTime(lead.updated_at)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
