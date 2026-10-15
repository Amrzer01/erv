"use client";

import { Calendar, Copy, ExternalLink, MessageSquare, Phone, Ticket, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { BookingConversionDialog } from "./booking-conversion-dialog";
import { LiveConversation } from "./live-conversation";
import type { Client, CustomerFollowUp, CustomerServiceRequest, Employee, PotentialClient } from "./types";
import {
  formatDateTime,
  formatPhoneNumber,
  formatRelativeTime,
  getStatusBgColor,
  getStatusBorderColor,
  getStatusColor,
  getStatusLabel,
} from "./utils";

interface CustomerDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  potentialClient: PotentialClient | null;
  followUps: CustomerFollowUp[];
  serviceRequests: CustomerServiceRequest[];
  employees: Employee[];
}

export function CustomerDetailsDrawer({
  open,
  onOpenChange,
  client,
  potentialClient,
  followUps,
  serviceRequests,
  employees,
}: CustomerDetailsDrawerProps) {
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [fullscreenChatOpen, setFullscreenChatOpen] = useState(false);
  const handleCopyPhone = () => {
    const phone = client?.phone || potentialClient?.phone;
    if (phone) {
      navigator.clipboard.writeText(formatPhoneNumber(phone));
      toast.success("تم نسخ رقم الهاتف");
    }
  };

  const handleWhatsApp = () => {
    const phone = client?.phone || potentialClient?.phone;
    if (phone) {
      const formattedPhone = formatPhoneNumber(phone).replace(/\+/g, "");
      window.open(`https://wa.me/${formattedPhone}`, "_blank");
    }
  };

  const initials = (client?.customer_name || potentialClient?.customer_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const customerName = client?.customer_name || potentialClient?.customer_name || "غير معروف";
  const phone = client?.phone || potentialClient?.phone || "N/A";

  const customerPhone = phone !== "N/A" ? formatPhoneNumber(phone) : "N/A";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[600px] md:w-[700px] overflow-y-auto" dir="rtl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">تفاصيل العميل</SheetTitle>
            <SheetClose asChild>
              <Button size="icon" variant="ghost">
                <X className="size-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6 pr-4">
            {/* Header with Avatar */}
            <div className="flex items-start gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-xl bg-gradient-to-br from-green-500 to-blue-600 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-xl font-semibold">{customerName}</h3>
                  <p className="text-muted-foreground font-mono text-sm" dir="ltr">
                    {phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyPhone}>
                    <Copy className="size-4 ml-2" />
                    نسخ
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleWhatsApp}>
                    <MessageSquare className="size-4 ml-2" />
                    واتساب
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Client Information */}
            {client && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">معلومات الحجز</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ticket className="size-4" />
                      <span>رقم التذكرة</span>
                    </div>
                    <div className="font-medium font-mono text-sm">{client.ticket_number}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="size-4" />
                      <span>عدد المسافرين</span>
                    </div>
                    <div className="font-medium">{client.passengers}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      <span>تاريخ الرحلة</span>
                    </div>
                    <div className="font-medium">{formatDateTime(client.trip_date)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      <span>نهاية الرحلة</span>
                    </div>
                    <div className="font-medium">{formatDateTime(client.trip_end_date)}</div>
                  </div>
                </div>
                {client.notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{client.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Potential Client Information */}
            {potentialClient && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">معلومات العميل المحتمل</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>احتمالية الحجز</span>
                    </div>
                    <div className="font-medium">{potentialClient.booking_probability}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>المرحلة</span>
                    </div>
                    <Badge variant="outline">{potentialClient.stage}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>عدد المتابعات</span>
                    </div>
                    <div className="font-medium">{potentialClient.follow_up_count}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      <span>التاريخ المتوقع</span>
                    </div>
                    <div className="font-medium">
                      {potentialClient.expected_trip_date
                        ? formatDateTime(potentialClient.expected_trip_date)
                        : "غير محدد"}
                    </div>
                  </div>
                </div>
                {potentialClient.summary && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{potentialClient.summary}</p>
                  </div>
                )}
                {potentialClient.last_message && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="size-4" />
                      <span>آخر رسالة AI</span>
                    </div>
                    <p className="text-sm">{potentialClient.last_message}</p>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Follow-ups Timeline */}
            {followUps.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">سجل المتابعات</h4>
                <div className="space-y-3">
                  {followUps.map((followUp) => (
                    <div key={followUp.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{followUp.event_name || followUp.follow_up_type}</span>
                        <Badge
                          variant="outline"
                          className={`${getStatusBorderColor(followUp.status)} ${getStatusBgColor(followUp.status)} ${getStatusColor(followUp.status)}`}
                        >
                          {getStatusLabel(followUp.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{formatDateTime(followUp.scheduled_for)}</span>
                      </div>
                      {followUp.last_message && <p className="text-sm line-clamp-2">{followUp.last_message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Requests */}
            {serviceRequests.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">طلبات الخدمة</h4>
                <div className="space-y-3">
                  {serviceRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{request.request_type}</span>
                        <Badge
                          variant="outline"
                          className={`${getStatusBorderColor(request.status)} ${getStatusBgColor(request.status)} ${getStatusColor(request.status)}`}
                        >
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{formatDateTime(request.created_at)}</span>
                      </div>
                      {request.ai_summary && <p className="text-sm line-clamp-2">{request.ai_summary}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Conversation */}
            {potentialClient && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">المحادثة الحية</h4>
                  <Button size="sm" onClick={() => setFullscreenChatOpen(true)}>
                    <MessageSquare className="size-4 ml-2" />
                    فتح المحادثة
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {client && (
                <Button className="flex-1" variant="outline">
                  <ExternalLink className="size-4 ml-2" />
                  فتح الحجز
                </Button>
              )}
              {potentialClient && (
                <>
                  <Button className="flex-1" variant="outline" onClick={() => setConversionDialogOpen(true)}>
                    <Ticket className="size-4 ml-2" />
                    تحويل إلى عميل
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <ExternalLink className="size-4 ml-2" />
                    فتح العميل المحتمل
                  </Button>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

      <BookingConversionDialog
        open={conversionDialogOpen}
        onOpenChange={setConversionDialogOpen}
        potentialClient={potentialClient}
        onSuccess={() => {
          toast.success("تم تحديث البيانات");
          onOpenChange(false);
        }}
      />

      {/* Fullscreen Chat Dialog */}
      {fullscreenChatOpen && potentialClient && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="border-b p-4 flex items-center justify-between bg-background">
            <h2 className="text-xl font-semibold">المحادثة الحية</h2>
            <Button onClick={() => setFullscreenChatOpen(false)} variant="outline">
              إغلاق
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <LiveConversation potentialClient={potentialClient} employees={employees} />
          </div>
        </div>
      )}
    </Sheet>
  );
}
