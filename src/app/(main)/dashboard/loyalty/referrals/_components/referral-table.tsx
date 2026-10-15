"use client";

import { motion } from "framer-motion";
import { Download, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ReferralTableProps {
  referrals: any[];
  accounts: any[];
  loading: boolean;
  onViewReferral: (referral: any) => void;
  onViewCustomer: (customer: any) => void;
}

export function ReferralTable({ referrals, accounts, loading, onViewReferral, onViewCustomer }: ReferralTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
    }
  };

  const exportCSV = () => {
    const headers = [
      "المعرف",
      "المحيل",
      "هاتف المحيل",
      "هاتف المحال إليه",
      "حالة الحجز",
      "حالة المكافأة",
      "تاريخ الإنشاء",
      "تاريخ المكافأة",
    ];
    const rows = referrals.map((r) => [
      r.id,
      r.referrer_name,
      r.referrer_phone,
      r.referred_phone,
      r.status,
      r.rewarded ? "ممنوحة" : "غير ممنوحة",
      r.created_at,
      r.rewarded_at || "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "referrals.csv";
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>جدول الإحالات</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="ml-2 size-4" />
          تصدير CSV
        </Button>
      </CardHeader>
      <CardContent>
        {referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 text-sm font-medium">المعرف</th>
                  <th className="text-right p-3 text-sm font-medium">المحيل</th>
                  <th className="text-right p-3 text-sm font-medium">هاتف المحيل</th>
                  <th className="text-right p-3 text-sm font-medium">هاتف المحال إليه</th>
                  <th className="text-right p-3 text-sm font-medium">حالة الحجز</th>
                  <th className="text-right p-3 text-sm font-medium">حالة المكافأة</th>
                  <th className="text-right p-3 text-sm font-medium">تاريخ الإنشاء</th>
                  <th className="text-right p-3 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {referrals.slice(0, 20).map((referral, index) => (
                  <motion.tr
                    key={referral.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onViewReferral(referral)}
                  >
                    <td className="p-3 text-sm font-mono" dir="ltr">
                      {referral.id?.slice(0, 8)}...
                    </td>
                    <td className="p-3 text-sm font-medium">{referral.referrer_name}</td>
                    <td className="p-3 text-sm font-mono" dir="ltr">
                      {referral.referrer_phone}
                    </td>
                    <td className="p-3 text-sm font-mono" dir="ltr">
                      {referral.referred_phone}
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(referral.status)}>{referral.status}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={referral.rewarded ? "default" : "outline"}>
                        {referral.rewarded ? "ممنوحة" : "غير ممنوحة"}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReferral(referral);
                        }}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-6 bg-muted rounded-full mb-4">
              <MoreHorizontal className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">لا توجد إحالات</h3>
            <p className="text-sm text-muted-foreground max-w-md">لم يتم تسجيل أي إحالات بعد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
