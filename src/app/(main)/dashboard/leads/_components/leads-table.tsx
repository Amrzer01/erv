"use client";

import { ChevronLeft, ChevronRight, Copy, Eye, MessageCircle, MoreHorizontal, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { PotentialClient } from "./types";
import {
  formatDate,
  formatRelativeTime,
  getFollowUpStatus,
  getProbabilityBadgeColor,
  getProbabilityColor,
} from "./utils";

interface LeadsTableProps {
  leads: PotentialClient[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (lead: PotentialClient) => void;
  onRetry: () => void;
}

export function LeadsTable({
  leads,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onRetry,
}: LeadsTableProps) {
  const pageSize = 25;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = leads.slice(startIndex, endIndex);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
  };

  const handleCopySummary = (summary: string) => {
    navigator.clipboard.writeText(summary);
  };

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone}`, "_blank");
  };

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
              <TableHead className="h-10 px-2 text-right">الاحتمال</TableHead>
              <TableHead className="h-10 px-2 text-right">المرحلة</TableHead>
              <TableHead className="h-10 px-2 text-right">الفئة</TableHead>
              <TableHead className="h-10 px-2 text-right">الرحلة المتوقعة</TableHead>
              <TableHead className="h-10 px-2 text-right">الحالة</TableHead>
              <TableHead className="h-10 px-2 text-right">المتابعات</TableHead>
              <TableHead className="h-10 px-2 text-right">آخر نشاط</TableHead>
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
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-12" />
                </TableCell>
                <TableCell className="p-2">
                  <Skeleton className="h-5 w-20" />
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

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="text-muted-foreground mb-4">
          <MoreHorizontal className="size-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">لا يوجد عملاء محتملون حالياً</h3>
        <p className="text-muted-foreground text-sm">سيظهر هنا العملاء المحتملون من المساعد الذكي</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">العميل</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">الهاتف</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">الاحتمال</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">المرحلة</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">الفئة</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">الرحلة المتوقعة</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">الحالة</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">المتابعات</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">آخر نشاط</TableHead>
              <TableHead className="h-10 px-2 text-right whitespace-nowrap">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onView(lead)}
              >
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="font-medium">{lead.customer_name}</div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="text-muted-foreground" dir="ltr">
                    {lead.phone}
                  </div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Badge variant={getProbabilityBadgeColor(lead.booking_probability)} className="font-medium">
                    {lead.booking_probability}%
                  </Badge>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="text-sm">{lead.stage}</div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{lead.booking_category || "-"}</div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    {lead.expected_trip_date ? formatDate(lead.expected_trip_date) : "-"}
                  </div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <Badge variant="outline">{lead.status}</Badge>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{lead.follow_up_count}</div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    {lead.last_message_at ? formatRelativeTime(lead.last_message_at) : "-"}
                  </div>
                </TableCell>
                <TableCell className="p-2 align-middle whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(lead);
                      }}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyPhone(lead.phone);
                      }}
                    >
                      <Phone className="size-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button size="icon-xs" variant="ghost">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyPhone(lead.phone)}>
                          <Phone className="ml-2 size-4" />
                          نسخ رقم الهاتف
                        </DropdownMenuItem>
                        {lead.summary && (
                          <DropdownMenuItem onClick={() => handleCopySummary(lead.summary!)}>
                            <Copy className="ml-2 size-4" />
                            نسخ الملخص
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleWhatsApp(lead.phone)}>
                          <MessageCircle className="ml-2 size-4" />
                          فتح واتساب
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            عرض {startIndex + 1} إلى {Math.min(endIndex, leads.length)} من {leads.length} عميل
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
