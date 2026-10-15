"use client";

import { RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { FilterState, SortField, SortOrder } from "./types";

interface LeadsToolbarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  availableStages: string[];
  availableStatuses: string[];
  availableCategories: string[];
}

export function LeadsToolbar({
  filters,
  onFilterChange,
  sortField,
  sortOrder,
  onSortChange,
  onRefresh,
  isRefreshing,
  availableStages,
  availableStatuses,
  availableCategories,
}: LeadsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم، الهاتف، الملخص..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="pr-10"
            />
          </div>
        </div>
        <Button onClick={onRefresh} variant="outline" disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filters.probabilityRange} onValueChange={(value) => onFilterChange({ probabilityRange: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الاحتمال" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="0-25">0-25%</SelectItem>
            <SelectItem value="26-50">26-50%</SelectItem>
            <SelectItem value="51-75">51-75%</SelectItem>
            <SelectItem value="76-100">76-100%</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => onFilterChange({ status: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.stage} onValueChange={(value) => onFilterChange({ stage: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="المرحلة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableStages.map((stage) => (
              <SelectItem key={stage} value={stage}>
                {stage}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.bookingCategory} onValueChange={(value) => onFilterChange({ bookingCategory: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(value) => onFilterChange({ dateRange: value })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="التاريخ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortField} onValueChange={(value) => onSortChange(value as SortField, sortOrder)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer_name">الاسم</SelectItem>
            <SelectItem value="booking_probability">الاحتمال</SelectItem>
            <SelectItem value="expected_trip_date">الرحلة</SelectItem>
            <SelectItem value="last_message_at">آخر نشاط</SelectItem>
            <SelectItem value="follow_up_count">المتابعات</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onSortChange(sortField, sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>
    </div>
  );
}
