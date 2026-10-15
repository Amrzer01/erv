"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount } from "../../_components/types";

interface ManualAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManualAdjustmentModal({ open, onOpenChange, onSuccess }: ManualAdjustmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyAccount | null>(null);
  const [customers, setCustomers] = useState<LoyaltyAccount[]>([]);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setCustomers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("loyalty_accounts")
        .select("*")
        .or(`customer_name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error("Error searching customers:", err);
    }
  };

  const handleSave = async () => {
    if (!selectedCustomer || points <= 0 || !reason) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);

      const newBalance =
        adjustmentType === "add"
          ? selectedCustomer.available_points + points
          : Math.max(0, selectedCustomer.available_points - points);

      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update loyalty_accounts
      const { error: updateError } = await supabase
        .from("loyalty_accounts")
        .update({ available_points: newBalance })
        .eq("id", selectedCustomer.id);

      if (updateError) throw updateError;

      // Insert transaction
      const { error: insertError } = await supabase.from("loyalty_transactions").insert({
        transaction_id: transactionId,
        customer_name: selectedCustomer.customer_name,
        phone: selectedCustomer.phone,
        type: adjustmentType === "add" ? "earned" : "redeemed",
        source: "manual",
        points: adjustmentType === "add" ? points : -points,
        status: "completed",
        reason,
        notes,
        previous_balance: selectedCustomer.available_points,
        new_balance,
        employee: "Admin",
      });

      if (insertError) throw insertError;

      toast.success("تم تعديل النقاط بنجاح");
      onOpenChange(false);
      onSuccess();

      // Reset form
      setSelectedCustomer(null);
      setPoints(0);
      setReason("");
      setNotes("");
      setSearchQuery("");
      setCustomers([]);
    } catch (err) {
      console.error("Error adjusting points:", err);
      toast.error("فشل تعديل النقاط");
    } finally {
      setLoading(false);
    }
  };

  const previewBalance = selectedCustomer
    ? adjustmentType === "add"
      ? selectedCustomer.available_points + points
      : Math.max(0, selectedCustomer.available_points - points)
    : 0;

  const difference = selectedCustomer ? (adjustmentType === "add" ? points : -points) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تعديل النقاط</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Customer */}
          <div>
            <Label>بحث عن العميل</Label>
            <Input
              placeholder="الاسم أو الهاتف..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchCustomers(e.target.value);
              }}
              className="mt-2"
            />
            {customers.length > 0 && (
              <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setSearchQuery(customer.customer_name);
                      setCustomers([]);
                    }}
                    className="w-full text-right p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                  >
                    <p className="font-medium">{customer.customer_name}</p>
                    <p className="text-sm text-muted-foreground" dir="ltr">
                      {customer.phone}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Customer */}
          {selectedCustomer && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{selectedCustomer.customer_name}</p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {selectedCustomer.phone}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                الرصيد الحالي: {selectedCustomer.available_points.toLocaleString("ar-SA")} نقطة
              </p>
            </div>
          )}

          {/* Adjustment Type */}
          <div>
            <Label>نوع التعديل</Label>
            <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">إضافة نقاط</SelectItem>
                <SelectItem value="subtract">خصم نقاط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Points */}
          <div>
            <Label>عدد النقاط</Label>
            <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="mt-2" />
          </div>

          {/* Reason */}
          <div>
            <Label>السبب</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: مكافأة خاصة"
              className="mt-2"
            />
          </div>

          {/* Notes */}
          <div>
            <Label>ملاحظات (اختياري)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ملاحظات داخلية..."
              className="mt-2"
            />
          </div>

          {/* Preview */}
          {selectedCustomer && points > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">الرصيد الحالي</span>
                <span className="font-medium">{selectedCustomer.available_points.toLocaleString("ar-SA")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">الفرق</span>
                <span className={`font-medium ${difference > 0 ? "text-green-600" : "text-red-600"}`}>
                  {difference > 0 ? "+" : ""}
                  {difference.toLocaleString("ar-SA")}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">الرصيد الجديد</span>
                <span className="font-bold">{previewBalance.toLocaleString("ar-SA")}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={loading || !selectedCustomer || points <= 0 || !reason}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
