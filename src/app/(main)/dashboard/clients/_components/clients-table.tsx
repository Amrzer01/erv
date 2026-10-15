"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Columns } from "./columns";
import type { Booking, Customer } from "./types";
import { formatMoney } from "./utils";

interface ClientsTableProps {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onRetry: () => void;
  onBookingUpdate: (updatedBooking: Booking) => void;
}

export function ClientsTable({
  customers,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onRetry,
  onBookingUpdate,
}: ClientsTableProps) {
  const pageSize = 25;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="text-muted-foreground mb-4">
          <MoreHorizontal className="size-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">حدث خطأ في تحميل البيانات</h3>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 px-2 text-right">العميل</TableHead>
              <TableHead className="h-10 px-2 text-right">الهاتف</TableHead>
              <TableHead className="h-10 px-2 text-right">عدد الحجوزات</TableHead>
              <TableHead className="h-10 px-2 text-right">إجمالي الإنفاق</TableHead>
              <TableHead className="h-10 px-2 text-right">آخر رحلة</TableHead>
              <TableHead className="h-10 px-2 text-right">نقطة التجمع</TableHead>
              <TableHead className="h-10 px-2 text-right">الحالة</TableHead>
              <TableHead className="h-10 px-2 text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-12" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="text-muted-foreground mb-4">
          <MoreHorizontal className="size-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">لا يوجد عملاء حتى الآن</h3>
        <p className="text-muted-foreground text-sm">سيظهر هنا العملاء المستخرجون من الحجوزات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 px-2 text-right">العميل</TableHead>
              <TableHead className="h-10 px-2 text-right">الهاتف</TableHead>
              <TableHead className="h-10 px-2 text-right">عدد الحجوزات</TableHead>
              <TableHead className="h-10 px-2 text-right">إجمالي الإنفاق</TableHead>
              <TableHead className="h-10 px-2 text-right">آخر رحلة</TableHead>
              <TableHead className="h-10 px-2 text-right">نقطة التجمع</TableHead>
              <TableHead className="h-10 px-2 text-right">الحالة</TableHead>
              <TableHead className="h-10 px-2 text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Columns customers={paginatedCustomers} onView={onView} onBookingUpdate={onBookingUpdate} />
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            عرض {startIndex + 1} إلى {Math.min(endIndex, customers.length)} من {customers.length} عميل
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronRight className="ml-1 size-4" />
              السابق
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              التالي
              <ChevronLeft className="mr-1 size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
