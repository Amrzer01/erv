"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Archive, Copy, Download, Edit, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

interface RewardCatalogProps {
  rewards: any[];
  loading: boolean;
  onEdit: (reward: any) => void;
  onRefresh: () => void;
}

export function RewardCatalog({ rewards, loading, onEdit, onRefresh }: RewardCatalogProps) {
  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="size-5" /> : <LucideIcons.Gift className="size-5" />;
  };

  const getStockDisplay = (reward: any) => {
    if (reward.unlimited_stock) return "غير محدود";
    if (reward.stock === 0) return "نفذت";
    return reward.stock?.toString() || "-";
  };

  const handleDuplicate = async (reward: any) => {
    try {
      const { error } = await supabase.from("loyalty_rewards").insert({
        name_ar: `${reward.name_ar} (نسخة)`,
        name_en: `${reward.name_en} (Copy)`,
        description_ar: reward.description_ar,
        description_en: reward.description_en,
        category: reward.category,
        points_required: reward.points_required,
        cash_value: reward.cash_value,
        icon: reward.icon,
        color: reward.color,
        stock: reward.stock,
        unlimited_stock: reward.unlimited_stock,
        partner_id: reward.partner_id,
        website: reward.website,
        discount_code: reward.discount_code,
        display_order: reward.display_order + 1,
        featured: false,
        is_active: false,
        metadata: reward.metadata,
      });

      if (error) throw error;
      toast.success("تم نسخ المكافأة بنجاح");
      onRefresh();
    } catch (err) {
      toast.error("فشل نسخ المكافأة");
    }
  };

  const handleToggleStatus = async (reward: any) => {
    try {
      const { error } = await supabase
        .from("loyalty_rewards")
        .update({ is_active: !reward.is_active })
        .eq("id", reward.id);

      if (error) throw error;
      toast.success("تم تحديث الحالة");
      onRefresh();
    } catch (err) {
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleToggleFeatured = async (reward: any) => {
    try {
      const { error } = await supabase
        .from("loyalty_rewards")
        .update({ featured: !reward.featured })
        .eq("id", reward.id);

      if (error) throw error;
      toast.success("تم تحديث التمييز");
      onRefresh();
    } catch (err) {
      toast.error("فشل تحديث التمييز");
    }
  };

  const handleDelete = async (reward: any) => {
    if (!confirm("هل أنت متأكد من حذف هذه المكافأة؟")) return;

    try {
      const { error } = await supabase.from("loyalty_rewards").delete().eq("id", reward.id);

      if (error) throw error;
      toast.success("تم حذف المكافأة");
      onRefresh();
    } catch (err) {
      toast.error("فشل حذف المكافأة");
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-lg font-bold mb-4">كتالوج المكافآت</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 mb-4" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-6 bg-muted rounded-full mb-4">
          <LucideIcons.Gift className="size-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">لا توجد مكافآت</h3>
        <p className="text-sm text-muted-foreground max-w-md">ابدأ بإضافة مكافآت جديدة</p>
      </div>
    );
  }

  const handleExportCSV = () => {
    const headers = [
      "المعرف",
      "الاسم بالعربية",
      "الاسم بالإنجليزية",
      "الفئة",
      "النقاط المطلوبة",
      "القيمة النقدية",
      "المخزون",
      "الحالة",
      "مميز",
    ];
    const rows = rewards.map((r) => [
      r.id,
      r.name_ar,
      r.name_en,
      r.category,
      r.points_required,
      r.cash_value,
      r.unlimited_stock ? "غير محدود" : r.stock,
      r.is_active ? "نشط" : "معطل",
      r.featured ? "نعم" : "لا",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewards.csv";
    a.click();
    toast.success("تم تصدير المكافآت");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">كتالوج المكافآت</h3>
        <Button size="sm" variant="outline" onClick={handleExportCSV}>
          <Download className="size-4 ml-2" />
          تصدير CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rewards.map((reward, index) => {
          const outOfStock = !reward.unlimited_stock && reward.stock === 0;
          const lowStock = !reward.unlimited_stock && reward.stock > 0 && reward.stock < 10;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={reward.featured ? "md:col-span-2 lg:col-span-1 xl:col-span-2" : ""}
            >
              <Card
                className={`hover:shadow-lg transition-all duration-300 relative ${
                  outOfStock ? "opacity-60" : ""
                } ${!reward.is_active ? "opacity-50" : ""} ${reward.featured ? "ring-2 ring-primary/50 shadow-xl" : ""}`}
              >
                {reward.featured && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    مميز
                  </div>
                )}

                {outOfStock && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    نفذت
                  </div>
                )}

                {lowStock && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    مخزون منخفض
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 bg-gradient-to-br ${reward.color || "from-blue-500 to-cyan-500"} rounded-xl text-white ${reward.featured ? "size-14" : ""}`}
                    >
                      {getIconComponent(reward.icon || "Gift")}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant={reward.is_active ? "default" : "outline"}>
                        {reward.is_active ? "نشط" : "معطل"}
                      </Badge>
                      {reward.category && (
                        <Badge variant="outline" className="text-xs">
                          {reward.category.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h4 className={`font-semibold mb-1 ${reward.featured ? "text-xl" : ""}`}>{reward.name_ar}</h4>
                  <p
                    className={`text-sm text-muted-foreground mb-3 line-clamp-2 ${reward.featured ? "text-base" : ""}`}
                  >
                    {reward.description_ar}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">النقاط المطلوبة</span>
                      <span className={`font-bold ${reward.featured ? "text-lg" : ""}`}>
                        {reward.points_required?.toLocaleString("ar-SA")}
                      </span>
                    </div>

                    {reward.cash_value && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">القيمة النقدية</span>
                        <span className="font-medium">{reward.cash_value.toLocaleString("ar-SA")} ريال</span>
                      </div>
                    )}

                    {reward.stock !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">المخزون</span>
                        <span
                          className={`font-medium ${outOfStock ? "text-red-500" : lowStock ? "text-orange-500" : ""}`}
                        >
                          {getStockDisplay(reward)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <Button size="sm" variant="outline" onClick={() => onEdit(reward)}>
                      <Edit className="size-3 ml-1" />
                      تعديل
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(reward)}>
                      <Copy className="size-3 ml-1" />
                      نسخ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleStatus(reward)}>
                      {reward.is_active ? <EyeOff className="size-3 ml-1" /> : <Eye className="size-3 ml-1" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleFeatured(reward)}>
                      {reward.featured ? <StarOff className="size-3 ml-1" /> : <Star className="size-3 ml-1" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(reward)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="size-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
