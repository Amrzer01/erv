"use client";

import { motion } from "framer-motion";
import { Download, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionLedgerProps {
  transactions: any[];
  loading: boolean;
  onViewTransaction: (transaction: any) => void;
}

export function TransactionLedger({ transactions, loading, onViewTransaction }: TransactionLedgerProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "earned":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "redeemed":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      case "manual":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "expired":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "booking":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      case "referral":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      case "welcome":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "google_review":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
      case "manual":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
    }
  };

  const exportCSV = () => {
    const headers = [
      "المعرف",
      "العميل",
      "الهاتف",
      "التذكرة",
      "النوع",
      "المصدر",
      "النقاط",
      "الحالة",
      "الموظف",
      "التاريخ",
    ];
    const rows = transactions.map((t) => [
      t.transaction_id,
      t.customer_name,
      t.phone,
      t.ticket_id,
      t.type,
      t.source,
      t.points,
      t.status,
      t.employee,
      t.created_at,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
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
        <CardTitle>سجل الحركات</CardTitle>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="ml-2 size-4" />
          تصدير CSV
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 text-sm font-medium">المعرف</th>
                  <th className="text-right p-3 text-sm font-medium">العميل</th>
                  <th className="text-right p-3 text-sm font-medium">الهاتف</th>
                  <th className="text-right p-3 text-sm font-medium">التذكرة</th>
                  <th className="text-right p-3 text-sm font-medium">النوع</th>
                  <th className="text-right p-3 text-sm font-medium">المصدر</th>
                  <th className="text-right p-3 text-sm font-medium">النقاط</th>
                  <th className="text-right p-3 text-sm font-medium">الحالة</th>
                  <th className="text-right p-3 text-sm font-medium">التاريخ</th>
                  <th className="text-right p-3 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 text-sm font-mono" dir="ltr">
                      {transaction.transaction_id?.slice(0, 8)}...
                    </td>
                    <td className="p-3 text-sm font-medium">{transaction.customer_name}</td>
                    <td className="p-3 text-sm font-mono" dir="ltr">
                      {transaction.phone}
                    </td>
                    <td className="p-3 text-sm font-mono" dir="ltr">
                      {transaction.ticket_id || "-"}
                    </td>
                    <td className="p-3">
                      <Badge className={getTypeColor(transaction.type)}>{transaction.type}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getSourceColor(transaction.source)} variant="outline">
                        {transaction.source}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm font-bold">{transaction.points?.toLocaleString("ar-SA")}</td>
                    <td className="p-3">
                      <Badge variant="outline">{transaction.status}</Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <Button size="icon" variant="ghost" onClick={() => onViewTransaction(transaction)}>
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
            <h3 className="text-lg font-medium mb-2">لا توجد حركات بعد</h3>
            <p className="text-sm text-muted-foreground max-w-md">ابدأ بإضافة حركات نقاط لرؤية السجل هنا</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
