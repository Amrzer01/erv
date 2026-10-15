"use client";

import { useEffect, useState } from "react";

import * as LucideIcons from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";

interface RewardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: any;
  partners: any[];
  onSave: () => void;
}

export function RewardFormModal({ open, onOpenChange, reward, partners, onSave }: RewardFormModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    category: "cash_discount",
    points_required: 0,
    cash_value: 0,
    icon: "Gift",
    color: "from-blue-500 to-cyan-500",
    stock: 0,
    unlimited_stock: false,
    partner_id: "",
    website: "",
    discount_code: "",
    display_order: 0,
    featured: false,
    is_active: true,
    metadata: "{}",
  });

  const colorOptions = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-violet-500",
    "from-green-500 to-emerald-500",
    "from-yellow-500 to-amber-500",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-cyan-500",
  ];

  const iconOptions = [
    "Gift",
    "Star",
    "Crown",
    "Award",
    "Medal",
    "Trophy",
    "Percent",
    "Wallet",
    "CreditCard",
    "DollarSign",
    "Coins",
    "Briefcase",
    "Package",
    "ShoppingBag",
    "ShoppingCart",
    "Plane",
    "Car",
    "Hotel",
    "MapPin",
    "Book",
    "FileText",
    "Calendar",
    "Clock",
    "Heart",
    "Sparkles",
    "Zap",
    "Flame",
  ];

  const categoryOptions = [
    { value: "cash_discount", label: "خصم نقدي" },
    { value: "vip_upgrade", label: "ترقية VIP" },
    { value: "physical_gift", label: "هدية مادية" },
    { value: "partner_offer", label: "عرض شريك" },
    { value: "campaign_reward", label: "مكافأة حملة" },
    { value: "automatic_reward", label: "مكافأة تلقائية" },
  ];

  useEffect(() => {
    if (reward) {
      setFormData({
        name_ar: reward.name_ar || "",
        name_en: reward.name_en || "",
        description_ar: reward.description_ar || "",
        description_en: reward.description_en || "",
        category: reward.category || "cash_discount",
        points_required: reward.points_required || 0,
        cash_value: reward.cash_value || 0,
        icon: reward.icon || "Gift",
        color: reward.color || "from-blue-500 to-cyan-500",
        stock: reward.stock || 0,
        unlimited_stock: reward.unlimited_stock || false,
        partner_id: reward.partner_id || "",
        website: reward.website || "",
        discount_code: reward.discount_code || "",
        display_order: reward.display_order || 0,
        featured: reward.featured || false,
        is_active: reward.is_active !== undefined ? reward.is_active : true,
        metadata: reward.metadata ? JSON.stringify(reward.metadata) : "{}",
      });
    } else {
      setFormData({
        name_ar: "",
        name_en: "",
        description_ar: "",
        description_en: "",
        category: "cash_discount",
        points_required: 0,
        cash_value: 0,
        icon: "Gift",
        color: "from-blue-500 to-cyan-500",
        stock: 0,
        unlimited_stock: false,
        partner_id: "",
        website: "",
        discount_code: "",
        display_order: 0,
        featured: false,
        is_active: true,
        metadata: "{}",
      });
    }
  }, [reward, open]);

  const handleSubmit = async () => {
    if (!formData.name_ar || !formData.description_ar) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);

      const data = {
        ...formData,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {},
      };

      if (reward) {
        const { error } = await supabase.from("loyalty_rewards").update(data).eq("id", reward.id);

        if (error) throw error;
        toast.success("تم تحديث المكافأة بنجاح");
      } else {
        const { error } = await supabase.from("loyalty_rewards").insert(data);

        if (error) throw error;
        toast.success("تم إنشاء المكافأة بنجاح");
      }

      onSave();
    } catch (err) {
      console.error("Error saving reward:", err);
      toast.error("فشل حفظ المكافأة");
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="size-5" /> : <LucideIcons.Gift className="size-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reward ? "تعديل المكافأة" : "مكافأة جديدة"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الاسم بالعربية *</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>الاسم بالإنجليزية</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>الوصف بالعربية *</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label>الوصف بالإنجليزية</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label>الفئة</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>النقاط المطلوبة *</Label>
                <Input
                  type="number"
                  value={formData.points_required}
                  onChange={(e) => setFormData({ ...formData, points_required: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>القيمة النقدية (ريال)</Label>
                <Input
                  type="number"
                  value={formData.cash_value}
                  onChange={(e) => setFormData({ ...formData, cash_value: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الأيقونة</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>اللون</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color} value={color}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded bg-gradient-to-br ${color}`} />
                          {color}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المخزون</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="mt-2"
                  disabled={formData.unlimited_stock}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.unlimited_stock}
                  onCheckedChange={(v) => setFormData({ ...formData, unlimited_stock: v })}
                />
                <Label>مخزون غير محدود</Label>
              </div>
            </div>

            <div>
              <Label>الشريك</Label>
              <Select value={formData.partner_id} onValueChange={(v) => setFormData({ ...formData, partner_id: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="اختر شريكاً (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون شريك</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الموقع الإلكتروني</Label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label>رمز الخصم</Label>
              <Input
                value={formData.discount_code}
                onChange={(e) => setFormData({ ...formData, discount_code: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ترتيب العرض</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                />
                <Label>مميز</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>نشط</Label>
            </div>

            <div>
              <Label>Metadata (JSON)</Label>
              <Textarea
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                className="mt-2 font-mono text-xs"
                rows={3}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <Label className="text-base font-semibold">معاينة حية</Label>
            <div className="mt-4">
              <Card className={`relative ${formData.featured ? "ring-2 ring-primary/50 shadow-xl" : ""}`}>
                {formData.featured && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    مميز
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${formData.color} rounded-xl text-white ${formData.featured ? "size-14" : ""}`}
                    >
                      {getIconComponent(formData.icon)}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={formData.is_active ? "default" : "outline"}>
                        {formData.is_active ? "نشط" : "معطل"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formData.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  <h4 className={`font-semibold mb-1 ${formData.featured ? "text-xl" : ""}`}>
                    {formData.name_ar || "اسم المكافأة"}
                  </h4>
                  <p className={`text-sm text-muted-foreground mb-3 ${formData.featured ? "text-base" : ""}`}>
                    {formData.description_ar || "وصف المكافأة"}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">النقاط المطلوبة</span>
                      <span className={`font-bold ${formData.featured ? "text-lg" : ""}`}>
                        {formData.points_required.toLocaleString("ar-SA")}
                      </span>
                    </div>

                    {formData.cash_value > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">القيمة النقدية</span>
                        <span className="font-medium">{formData.cash_value.toLocaleString("ar-SA")} ريال</span>
                      </div>
                    )}

                    {!formData.unlimited_stock && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">المخزون</span>
                        <span className="font-medium">{formData.stock.toLocaleString("ar-SA")}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "جاري الحفظ..." : reward ? "تحديث" : "إنشاء"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
