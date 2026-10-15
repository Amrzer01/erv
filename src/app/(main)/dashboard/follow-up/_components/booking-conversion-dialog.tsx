"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { convertPotentialClientToClient } from "../_actions/follow-ups";
import type { PotentialClient } from "./types";

interface BookingConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  potentialClient: PotentialClient | null;
  onSuccess?: () => void;
}

export function BookingConversionDialog({ open, onOpenChange, potentialClient, onSuccess }: BookingConversionDialogProps) {
  const { currentEmployee } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    booking_category: "",
    passengers: 1,
    trip_date: "",
    room_details: "",
    total_price: 0,
    meeting_place: "مسجد قباء",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!potentialClient?.id || !currentEmployee?.id) return;

    setLoading(true);

    try {
      const result = await convertPotentialClientToClient(potentialClient.id, currentEmployee.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`تم تحويل العميل بنجاح! رقم التذكرة: ${result.ticketNumber}`);
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error converting client:", error);
      toast.error("فشل تحويل العميل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تحويل العميل المحتمل إلى عميل</DialogTitle>
          <DialogDescription>
            أكمل تفاصيل الحجز لتحويل {potentialClient?.customer_name || potentialClient?.phone} إلى عميل رسمي
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">اسم العميل</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder={potentialClient?.customer_name || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_category">فئة الحجز</Label>
            <Select value={formData.booking_category} onValueChange={(value) => setFormData({ ...formData, booking_category: value })} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="عوائل">عوائل</SelectItem>
                <SelectItem value="عزاب">عزاب</SelectItem>
                <SelectItem value="مجموعات">مجموعات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passengers">عدد المسافرين</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                value={formData.passengers}
                onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_price">السعر الإجمالي</Label>
              <Input
                id="total_price"
                type="number"
                min="0"
                value={formData.total_price}
                onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip_date">تاريخ الرحلة</Label>
            <Input
              id="trip_date"
              type="date"
              value={formData.trip_date}
              onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_details">تفاصيل الغرف</Label>
            <Input
              id="room_details"
              value={formData.room_details}
              onChange={(e) => setFormData({ ...formData, room_details: e.target.value })}
              placeholder="مثال: غرفة مزدوجة، غرفة فردية"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_place">مكان اللقاء</Label>
            <Input
              id="meeting_place"
              value={formData.meeting_place}
              onChange={(e) => setFormData({ ...formData, meeting_place: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري التحويل..." : "تحويل إلى عميل"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
