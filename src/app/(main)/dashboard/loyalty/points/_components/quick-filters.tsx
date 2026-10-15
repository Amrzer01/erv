"use client";

import { Filter, RefreshCw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuickFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function QuickFilters({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  sourceFilter,
  onSourceFilterChange,
  onRefresh,
  refreshing,
}: QuickFiltersProps) {
  const hasActiveFilter =
    searchQuery || dateFilter !== "all" || statusFilter !== "all" || typeFilter !== "all" || sourceFilter !== "all";

  const handleReset = () => {
    onSearchChange("");
    onDateFilterChange("all");
    onStatusFilterChange("all");
    onTypeFilterChange("all");
    onSourceFilterChange("all");
  };

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-muted rounded-xl">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو الهاتف أو المعرف..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
      </div>

      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="التاريخ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="today">اليوم</SelectItem>
          <SelectItem value="week">آخر أسبوع</SelectItem>
          <SelectItem value="month">آخر شهر</SelectItem>
          <SelectItem value="quarter">آخر ربع</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="completed">مكتمل</SelectItem>
          <SelectItem value="pending">معلق</SelectItem>
          <SelectItem value="expired">منتهي</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="النوع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="earned">مكتسب</SelectItem>
          <SelectItem value="redeemed">مستهلك</SelectItem>
          <SelectItem value="manual">يدوي</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="المصدر" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="booking">حجز</SelectItem>
          <SelectItem value="referral">إحالة</SelectItem>
          <SelectItem value="welcome">ترحيب</SelectItem>
          <SelectItem value="manual">يدوي</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleReset} disabled={!hasActiveFilter}>
        <X className="ml-2 size-4" />
        إعادة تعيين
      </Button>

      <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={`ml-2 size-4 ${refreshing ? "animate-spin" : ""}`} />
        تحديث
      </Button>
    </div>
  );
}
