"use client";

import { Filter, RefreshCw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuickFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  rewardFilter: string;
  onRewardFilterChange: (value: string) => void;
  bookingFilter: string;
  onBookingFilterChange: (value: string) => void;
  tierFilter: string;
  onTierFilterChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function QuickFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  rewardFilter,
  onRewardFilterChange,
  bookingFilter,
  onBookingFilterChange,
  tierFilter,
  onTierFilterChange,
  onRefresh,
  refreshing,
}: QuickFiltersProps) {
  const hasActiveFilter =
    searchQuery || statusFilter !== "all" || rewardFilter !== "all" || bookingFilter !== "all" || tierFilter !== "all";

  const handleReset = () => {
    onSearchChange("");
    onStatusFilterChange("all");
    onRewardFilterChange("all");
    onBookingFilterChange("all");
    onTierFilterChange("all");
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

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="pending">معلق</SelectItem>
          <SelectItem value="booked">مكتمل</SelectItem>
          <SelectItem value="cancelled">ملغي</SelectItem>
        </SelectContent>
      </Select>

      <Select value={rewardFilter} onValueChange={onRewardFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="المكافأة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="rewarded">ممنوحة</SelectItem>
          <SelectItem value="not_rewarded">غير ممنوحة</SelectItem>
        </SelectContent>
      </Select>

      <Select value={bookingFilter} onValueChange={onBookingFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="الحجز" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="completed">مكتمل</SelectItem>
          <SelectItem value="not_completed">غير مكتمل</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tierFilter} onValueChange={onTierFilterChange}>
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
