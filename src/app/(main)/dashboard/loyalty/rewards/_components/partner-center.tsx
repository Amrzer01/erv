"use client";

import { motion } from "framer-motion";
import { Building2, Globe, MoreHorizontal, Plus, Ticket } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";

interface PartnerCenterProps {
  partners: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function PartnerCenter({ partners, loading, onRefresh }: PartnerCenterProps) {
  const handleDelete = async (partner: any) => {
    if (!confirm("هل أنت متأكد من حذف هذا الشريك؟")) return;

    try {
      const { error } = await supabase.from("loyalty_partners").delete().eq("id", partner.id);

      if (error) throw error;
      toast.success("تم حذف الشريك");
      onRefresh();
    } catch (err) {
      toast.error("فشل حذف الشريك");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>مركز الشركاء</CardTitle>
        <Button size="sm">
          <Plus className="size-4 ml-2" />
          شريك جديد
        </Button>
      </CardHeader>
      <CardContent>
        {partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                        <Building2 className="size-5" />
                      </div>
                      <Badge variant={partner.is_active ? "default" : "outline"}>
                        {partner.is_active ? "نشط" : "معطل"}
                      </Badge>
                    </div>

                    <h4 className="font-semibold mb-1">{partner.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{partner.description || "-"}</p>

                    <div className="space-y-2 mb-4">
                      {partner.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="size-4 text-muted-foreground" />
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                            dir="ltr"
                          >
                            {partner.website}
                          </a>
                        </div>
                      )}

                      {partner.discount_code && (
                        <div className="flex items-center gap-2 text-sm">
                          <Ticket className="size-4 text-muted-foreground" />
                          <span className="font-mono bg-muted px-2 py-1 rounded">{partner.discount_code}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground mb-4">
                      <span>القسائم المصدرة</span>
                      <span className="font-medium">{partner.issued_coupons || 0}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(partner)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-6 bg-muted rounded-full mb-4">
              <Building2 className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">لا يوجد شركاء</h3>
            <p className="text-sm text-muted-foreground max-w-md">ابدأ بإضافة شركاء جدد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
