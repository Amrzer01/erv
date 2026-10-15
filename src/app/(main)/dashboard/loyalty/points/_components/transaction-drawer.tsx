"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Hash, Phone, Ticket, User, UserCheck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface TransactionDrawerProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDrawer({ transaction, open, onOpenChange }: TransactionDrawerProps) {
  if (!transaction) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "earned":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "redeemed":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      case "manual":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>تفاصيل الحركة</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Transaction Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-muted rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hash className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground" dir="ltr">
                  {transaction.transaction_id}
                </span>
              </div>
              <Badge className={getTypeColor(transaction.type)}>{transaction.type}</Badge>
            </div>
            <div className="text-3xl font-bold">{transaction.points?.toLocaleString("ar-SA")} نقطة</div>
          </motion.div>

          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">معلومات العميل</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{transaction.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الهاتف</p>
                  <p className="font-medium" dir="ltr">
                    {transaction.phone}
                  </p>
                </div>
              </div>
              {transaction.ticket_id && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Ticket className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">رقم التذكرة</p>
                    <p className="font-medium" dir="ltr">
                      {transaction.ticket_id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Balance Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">الرصيد</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-muted-foreground" />
                  <span className="text-sm">الرصيد السابق</span>
                </div>
                <span className="font-bold">{transaction.previous_balance?.toLocaleString("ar-SA") || "0"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-muted-foreground" />
                  <span className="text-sm">الرصيد الجديد</span>
                </div>
                <span className="font-bold">{transaction.new_balance?.toLocaleString("ar-SA") || "0"}</span>
              </div>
            </div>
          </motion.div>

          {/* Transaction Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="font-semibold">تفاصيل الحركة</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">السبب</p>
                  <p className="font-medium">{transaction.reason || "-"}</p>
                </div>
              </div>
              {transaction.notes && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">ملاحظات</p>
                    <p className="font-medium">{transaction.notes}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <UserCheck className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الموظف</p>
                  <p className="font-medium">{transaction.employee || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium">{new Date(transaction.created_at).toLocaleString("ar-SA")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
