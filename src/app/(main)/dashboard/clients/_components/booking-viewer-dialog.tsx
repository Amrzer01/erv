"use client";

import { useRef, useState } from "react";

import { toPng } from "html-to-image";
import { Download, Printer, Ticket, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Booking } from "./types";
import { formatDate, formatMoney, getStatusBadgeVariant } from "./utils";

interface BookingViewerDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingViewerDialog({ booking, open, onOpenChange }: BookingViewerDialogProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const passengers = booking?.customer_name.split("،").map((p) => p.trim()) || [];
  const hasMultiplePassengers = passengers.length > 1;

  const handleExportPng = async () => {
    if (!ticketRef.current || !booking) return;

    try {
      setIsExporting(true);
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `booking-${booking.ticket_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export PNG:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!ticketRef.current) return;
    const printContent = ticketRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
        <head>
          <title>حجز ${booking?.ticket_number}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; direction: rtl; }
            .ticket { border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; }
            .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6; }
            .header-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .row { display: flex; margin-bottom: 12px; }
            .label { width: 140px; color: #6b7280; font-size: 14px; }
            .value { flex: 1; font-weight: 500; font-size: 15px; }
            .passenger { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
            .passenger::before { content: "•"; color: #3b82f6; font-size: 18px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
            .badge-default { background: #3b82f6; color: white; }
            .badge-secondary { background: #6b7280; color: white; }
            .badge-destructive { background: #ef4444; color: white; }
            .badge-outline { border: 1px solid #d1d5db; background: white; }
          </style>
        </head>
        <body>
          <div class="ticket">${printContent}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Ticket className="size-5" />
            تفاصيل الحجز
          </DialogTitle>
        </DialogHeader>

        <div
          ref={ticketRef}
          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Ticket className="size-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">تذكرة حجز</h3>
              <p className="text-sm text-slate-500">رقم التذكرة: {booking.ticket_number}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">اسم العميل</span>
              <span className="flex-1 font-medium text-slate-800">{passengers[0]}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">الهاتف</span>
              <span className="flex-1 font-medium text-slate-800" dir="ltr">
                {booking.phone}
              </span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">نوع الحجز</span>
              <span className="flex-1 font-medium text-slate-800">{booking.booking_category}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">عدد الركاب</span>
              <span className="flex-1 font-medium text-slate-800">{passengers.length}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">تفاصيل الغرفة</span>
              <span className="flex-1 font-medium text-slate-800">{booking.room_details}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">السعر</span>
              <span className="flex-1 font-bold text-slate-800">{formatMoney(booking.total_price)}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">موعد الرحلة</span>
              <span className="flex-1 font-medium text-slate-800">{formatDate(booking.trip_date)}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">مكان التجمع</span>
              <span className="flex-1 font-medium text-slate-800">{booking.meeting_place}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">تاريخ إنشاء التذكرة</span>
              <span className="flex-1 font-medium text-slate-800">{formatDate(booking.ticket_issue_date)}</span>
            </div>

            <div className="flex">
              <span className="w-40 text-slate-600 text-sm">الحالة</span>
              <span className="flex-1">
                <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
              </span>
            </div>

            {hasMultiplePassengers && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="w-40 text-slate-600 text-sm block mb-2">الركاب</span>
                <div className="space-y-1">
                  {passengers.map((passenger, index) => (
                    <div key={index} className="flex items-center gap-2 text-slate-700">
                      <span className="text-blue-600 text-lg">•</span>
                      <span>{passenger}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="w-40 text-slate-600 text-sm block mb-2">الملاحظات</span>
                <p className="text-slate-700 text-sm bg-white p-3 rounded-lg border border-slate-200">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 justify-end">
          <Button variant="outline" onClick={handleExportPng} disabled={isExporting} className="gap-2">
            <Download className="size-4" />
            {isExporting ? "جاري التحميل..." : "تحميل PNG"}
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="size-4" />
            طباعة
          </Button>
          <Button variant="default" onClick={() => onOpenChange(false)} className="gap-2">
            <X className="size-4" />
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
