"use client";

import { useState } from "react";

import { Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Account } from "./types";
import { formatDateTime, getStatusBadgeVariant, getStatusLabel } from "./utils";

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onView: (account: Account) => void;
  onDelete: (account: Account) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AccountsTable({
  accounts,
  loading,
  error,
  onView,
  onDelete,
  onRefresh,
  isRefreshing,
}: AccountsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccounts = accounts.filter(
    (account) =>
      account.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.safe_id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive mb-4">حدث خطأ أثناء تحميل الحسابات</p>
        <Button onClick={onRefresh} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="rounded-md border">
          <div className="grid grid-cols-5 gap-4 p-4 border-b">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <div className="mx-auto size-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <Search className="size-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">لا توجد حسابات متصلة</h3>
        <p className="text-muted-foreground">لم يتم إضافة أي حسابات واتساب بعد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو Safe ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={onRefresh} variant="outline" size="icon" disabled={isRefreshing}>
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم المعروض</TableHead>
              <TableHead>Safe ID</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>آخر تحديث</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد نتائج مطابقة للبحث
                </TableCell>
              </TableRow>
            ) : (
              filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.display_name}</TableCell>
                  <TableCell className="font-mono text-sm" dir="ltr">
                    {account.safe_id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(account.status)}>{getStatusLabel(account.status)}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(account.created_at)}</TableCell>
                  <TableCell>{formatDateTime(account.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-start">
                      <Button size="icon" variant="ghost" onClick={() => onView(account)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(account)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
