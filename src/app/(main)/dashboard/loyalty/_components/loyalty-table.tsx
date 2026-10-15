"use client";

import { useState } from "react";

import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Download,
  Edit,
  Eye,
  Filter,
  Medal,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { LoyaltyAccount, LoyaltyTier } from "./types";

interface LoyaltyTableProps {
  accounts: LoyaltyAccount[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onViewCard: (account: LoyaltyAccount) => void;
  onAdjustPoints: (account: LoyaltyAccount) => void;
}

export function LoyaltyTable({ accounts, loading, error, onRetry, onViewCard, onAdjustPoints }: LoyaltyTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<LoyaltyTier | "all">("all");
  const [sortBy, setSortBy] = useState<string>("total_spent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const pageSize = 25;

  // Filter and sort accounts
  const filteredAccounts = accounts
    .filter((account) => {
      const matchesSearch =
        account.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || account.phone.includes(searchQuery);
      const matchesTier = tierFilter === "all" || account.loyalty_tier === tierFilter;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof LoyaltyAccount];
      const bVal = b[sortBy as keyof LoyaltyAccount];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredAccounts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  const getTierIcon = (tier: LoyaltyTier) => {
    switch (tier) {
      case "Platinum":
        return <Crown className="size-4 text-amber-500" />;
      case "Gold":
        return <Medal className="size-4 text-yellow-500" />;
      case "Silver":
        return <Award className="size-4 text-gray-400" />;
    }
  };

  const getTierBadge = (tier: LoyaltyTier) => {
    switch (tier) {
      case "Platinum":
        return <Badge className="bg-amber-500 hover:bg-amber-600">Platinum</Badge>;
      case "Gold":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Gold</Badge>;
      case "Silver":
        return <Badge className="bg-gray-400 hover:bg-gray-500">Silver</Badge>;
    }
  };

  const getStatusBadge = (lastActivity: string) => {
    const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity <= 30) {
      return <Badge className="bg-green-500 hover:bg-green-600">نشط</Badge>;
    }
    if (daysSinceActivity <= 90) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">متوسط</Badge>;
    }
    return <Badge className="bg-red-500 hover:bg-red-600">خامل</Badge>;
  };

  const handleExportCSV = () => {
    const headers = [
      "Customer",
      "Phone",
      "Tier",
      "Available Points",
      "Lifetime Points",
      "Spent Points",
      "Bookings",
      "Total Spending",
      "Referral Count",
      "Last Trip",
      "Last Activity",
    ];
    const rows = filteredAccounts.map((acc) => [
      acc.customer_name,
      acc.phone,
      acc.loyalty_tier,
      acc.available_points,
      acc.total_points,
      acc.spent_points,
      acc.bookings_count,
      acc.total_spent,
      acc.referral_count || 0,
      acc.last_trip_date || "N/A",
      acc.last_activity_at,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "loyalty-accounts.csv";
    link.click();
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
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-10 px-2 text-right">العميل</TableHead>
                  <TableHead className="h-10 px-2 text-right">الهاتف</TableHead>
                  <TableHead className="h-10 px-2 text-right">المستوى</TableHead>
                  <TableHead className="h-10 px-2 text-right">النقاط المتاحة</TableHead>
                  <TableHead className="h-10 px-2 text-right">النقاط الكلية</TableHead>
                  <TableHead className="h-10 px-2 text-right">النقاط المستهلكة</TableHead>
                  <TableHead className="h-10 px-2 text-right">الحجوزات</TableHead>
                  <TableHead className="h-10 px-2 text-right">الإنفاق</TableHead>
                  <TableHead className="h-10 px-2 text-right">الإحالات</TableHead>
                  <TableHead className="h-10 px-2 text-right">آخر رحلة</TableHead>
                  <TableHead className="h-10 px-2 text-right">آخر نشاط</TableHead>
                  <TableHead className="h-10 px-2 text-right">الحالة</TableHead>
                  <TableHead className="h-10 px-2 text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(12)].map((_, j) => (
                      <TableCell key={j} className="p-2">
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="text-muted-foreground mb-4">
          <Award className="size-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">لا يوجد أعضاء ولاء</h3>
        <p className="text-muted-foreground text-sm">سيظهر هنا العملاء الذين لديهم حجوزات</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as LoyaltyTier | "all")}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total_spent">الإنفاق</SelectItem>
              <SelectItem value="total_points">النقاط</SelectItem>
              <SelectItem value="bookings_count">الحجوزات</SelectItem>
              <SelectItem value="last_activity_at">آخر نشاط</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
            <Filter className="size-4" />
          </Button>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="ml-2 size-4" />
            تصدير CSV
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-10 px-2 text-right">العميل</TableHead>
                <TableHead className="h-10 px-2 text-right">الهاتف</TableHead>
                <TableHead className="h-10 px-2 text-right">المستوى</TableHead>
                <TableHead className="h-10 px-2 text-right">النقاط المتاحة</TableHead>
                <TableHead className="h-10 px-2 text-right">النقاط الكلية</TableHead>
                <TableHead className="h-10 px-2 text-right">النقاط المستهلكة</TableHead>
                <TableHead className="h-10 px-2 text-right">الحجوزات</TableHead>
                <TableHead className="h-10 px-2 text-right">الإنفاق</TableHead>
                <TableHead className="h-10 px-2 text-right">الإحالات</TableHead>
                <TableHead className="h-10 px-2 text-right">آخر رحلة</TableHead>
                <TableHead className="h-10 px-2 text-right">آخر نشاط</TableHead>
                <TableHead className="h-10 px-2 text-right">الحالة</TableHead>
                <TableHead className="h-10 px-2 text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-muted/50">
                  <TableCell className="p-2 font-medium">{account.customer_name}</TableCell>
                  <TableCell className="p-2 font-mono text-sm" dir="ltr">
                    {account.phone}
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center gap-2">
                      {getTierIcon(account.loyalty_tier)}
                      {getTierBadge(account.loyalty_tier)}
                    </div>
                  </TableCell>
                  <TableCell className="p-2">{account.available_points.toLocaleString("ar-SA")}</TableCell>
                  <TableCell className="p-2">{account.total_points.toLocaleString("ar-SA")}</TableCell>
                  <TableCell className="p-2">{account.spent_points.toLocaleString("ar-SA")}</TableCell>
                  <TableCell className="p-2">{account.bookings_count.toLocaleString("ar-SA")}</TableCell>
                  <TableCell className="p-2">{account.total_spent.toLocaleString("ar-SA")} SAR</TableCell>
                  <TableCell className="p-2">{account.referral_count || 0}</TableCell>
                  <TableCell className="p-2 text-sm">
                    {account.last_trip_date ? new Date(account.last_trip_date).toLocaleDateString("ar-SA") : "N/A"}
                  </TableCell>
                  <TableCell className="p-2 text-sm text-muted-foreground">
                    {new Date(account.last_activity_at).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell className="p-2">{getStatusBadge(account.last_activity_at)}</TableCell>
                  <TableCell className="p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewCard(account)}>
                          <Eye className="ml-2 size-4" />
                          بطاقة الولاء
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(`/dashboard/clients?phone=${account.phone}`, "_blank")}
                        >
                          <Calendar className="ml-2 size-4" />
                          ملف CRM
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAdjustPoints(account)}>
                          <CreditCard className="ml-2 size-4" />
                          تعديل النقاط
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="ml-2 size-4" />
                          تعديل الولاء
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              عرض {startIndex + 1} - {Math.min(endIndex, filteredAccounts.length)} من {filteredAccounts.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="size-4 ml-2" />
                السابق
              </Button>
              <div className="text-sm">
                صفحة {currentPage} من {totalPages}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
                <ChevronLeft className="size-4 mr-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
