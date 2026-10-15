"use client";

import { useEffect, useState } from "react";

import { Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { syncLoyaltyForPhone } from "@/lib/loyalty/sync";
import { supabase } from "@/lib/supabase/client";

import type { Booking } from "./types";

interface BookingEditDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedBooking: Booking) => void;
}

export function BookingEditDialog({ booking, open, onOpenChange, onUpdate }: BookingEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Booking>>({});
  const [passengerList, setPassengerList] = useState<string[]>([]);
  const [newPassenger, setNewPassenger] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const statusOptions = ["جديد", "مؤكد", "ملغي", "مكتمل", "قيد الانتظار"];

  useEffect(() => {
    if (booking && open) {
      setFormData({ ...booking });
      if (typeof booking.passengers === "string" && booking.passengers) {
        setPassengerList(
          booking.passengers
            .split("،")
            .map((p) => p.trim())
            .filter((p) => p),
        );
      } else {
        setPassengerList([]);
      }
    }
  }, [booking, open]);

  const handleInputChange = (field: keyof Booking, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPassenger = () => {
    if (newPassenger.trim()) {
      setPassengerList((prev) => [...prev, newPassenger.trim()]);
      setNewPassenger("");
    }
  };

  const handleRemovePassenger = (index: number) => {
    setPassengerList((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePassengerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPassenger();
    }
  };

  const validateForm = (): boolean => {
    if (!formData.ticket_number?.trim()) {
      toast.error("رقم التذكرة مطلوب");
      return false;
    }
    if (!formData.customer_name?.trim()) {
      toast.error("اسم العميل مطلوب");
      return false;
    }
    if (!formData.phone?.trim()) {
      toast.error("رقم الهاتف مطلوب");
      return false;
    }
    if (!formData.booking_category?.trim()) {
      toast.error("نوع الحجز مطلوب");
      return false;
    }
    if (!formData.total_price || formData.total_price <= 0) {
      toast.error("السعر مطلوب ويجب أن يكون أكبر من صفر");
      return false;
    }
    if (!formData.trip_date?.trim()) {
      toast.error("موعد الرحلة مطلوب");
      return false;
    }
    if (!formData.meeting_place?.trim()) {
      toast.error("مكان التجمع مطلوب");
      return false;
    }
    if (!formData.status?.trim()) {
      toast.error("الحالة مطلوبة");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!booking || !validateForm()) return;

    try {
      setIsSaving(true);

      const passengersValue = passengerList.join("، ");

      const { error: updateError } = await supabase
        .from("clients")
        .update({
          ticket_number: formData.ticket_number,
          customer_name: formData.customer_name,
          phone: formData.phone,
          booking_category: formData.booking_category,
          passengers: passengersValue,
          room_details: formData.room_details,
          total_price: formData.total_price,
          trip_date: formData.trip_date,
          meeting_place: formData.meeting_place,
          ticket_issue_date: formData.ticket_issue_date,
          status: formData.status,
          notes: formData.notes,
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // Sync loyalty account for both old and new phone (if phone changed)
      const oldPhone = booking.phone;
      const newPhone = formData.phone;

      if (oldPhone && newPhone && oldPhone !== newPhone) {
        await syncLoyaltyForPhone(oldPhone);
      }
      if (newPhone) {
        await syncLoyaltyForPhone(newPhone);
      }

      const updatedBooking: Booking = {
        ...booking,
        ticket_number: formData.ticket_number!,
        customer_name: formData.customer_name!,
        phone: formData.phone!,
        booking_category: formData.booking_category!,
        passengers: passengersValue,
        room_details: formData.room_details || "",
        total_price: formData.total_price!,
        trip_date: formData.trip_date!,
        meeting_place: formData.meeting_place!,
        ticket_issue_date: formData.ticket_issue_date || booking.ticket_issue_date,
        status: formData.status!,
        notes: formData.notes || null,
      };

      onUpdate(updatedBooking);
      toast.success("تم تحديث الحجز بنجاح");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update booking:", error);
      toast.error("فشل تحديث الحجز");
    } finally {
      setIsSaving(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Pencil className="size-5" />
            تعديل الحجز
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ticket_number">رقم التذكرة *</Label>
            <Input
              id="ticket_number"
              value={formData.ticket_number || ""}
              onChange={(e) => handleInputChange("ticket_number", e.target.value)}
              placeholder="أدخل رقم التذكرة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name">اسم العميل *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name || ""}
              onChange={(e) => handleInputChange("customer_name", e.target.value)}
              placeholder="أدخل اسم العميل"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">الهاتف *</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="أدخل رقم الهاتف"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_category">نوع الحجز *</Label>
            <Input
              id="booking_category"
              value={formData.booking_category || ""}
              onChange={(e) => handleInputChange("booking_category", e.target.value)}
              placeholder="أدخل نوع الحجز"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>الركاب</Label>
            <div className="flex gap-2">
              <Input
                value={newPassenger}
                onChange={(e) => setNewPassenger(e.target.value)}
                onKeyDown={handlePassengerKeyDown}
                placeholder="أدخل اسم الراكب"
                dir="rtl"
              />
              <Button type="button" onClick={handleAddPassenger} size="icon" variant="outline">
                <Plus className="size-4" />
              </Button>
            </div>
            {passengerList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {passengerList.map((passenger, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                    <span>{passenger}</span>
                    <Button type="button" size="icon-xs" variant="ghost" onClick={() => handleRemovePassenger(index)}>
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="room_details">تفاصيل الغرفة</Label>
            <Input
              id="room_details"
              value={formData.room_details || ""}
              onChange={(e) => handleInputChange("room_details", e.target.value)}
              placeholder="أدخل تفاصيل الغرفة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_price">السعر *</Label>
            <Input
              id="total_price"
              type="number"
              value={formData.total_price || ""}
              onChange={(e) => handleInputChange("total_price", parseFloat(e.target.value) || 0)}
              placeholder="أدخل السعر"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip_date">موعد الرحلة *</Label>
            <Input
              id="trip_date"
              type="date"
              value={formData.trip_date ? formData.trip_date.split("T")[0] : ""}
              onChange={(e) => handleInputChange("trip_date", e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_place">مكان التجمع *</Label>
            <Input
              id="meeting_place"
              value={formData.meeting_place || ""}
              onChange={(e) => handleInputChange("meeting_place", e.target.value)}
              placeholder="أدخل مكان التجمع"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket_issue_date">تاريخ إنشاء التذكرة</Label>
            <Input
              id="ticket_issue_date"
              type="date"
              value={formData.ticket_issue_date ? formData.ticket_issue_date.split("T")[0] : ""}
              onChange={(e) => handleInputChange("ticket_issue_date", e.target.value)}
              dir="ltr"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="status">الحالة *</Label>
            <Select value={formData.status || ""} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">الملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="أدخل الملاحظات"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ التغييرات"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
