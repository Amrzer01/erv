"use client";

import { Filter, Plus, RefreshCw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuickFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  partnerFilter: string;
  onPartnerFilterChange: (value: string) => void;
  partners: any[];
  onRefresh: () => void;
  refreshing: boolean;
  onCreateReward: () => void;
}

export function QuickFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  partnerFilter,
  onPartnerFilterChange,
  partners,
  onRefresh,
  refreshing,
  onCreateReward,
}: QuickFiltersProps) {
  const hasActiveFilter = searchQuery || categoryFilter !== "all" || statusFilter !== "all" || partnerFilter !== "all";

  const handleReset = () => {
    onSearchChange("");
    onCategoryFilterChange("all");
    onStatusFilterChange("all");
    onPartnerFilterChange("all");
  };

  const categories = [
    "cash_discount",
    "vip_upgrade",
    "physical_gift",
    "partner_offer",
    "campaign_reward",
    "automatic_reward",
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center p-4 bg-muted rounded-xl">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو الوصف..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10"
        />
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="الفئة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          <SelectItem value="active">نشط</SelectItem>
          <SelectItem value="inactive">غير نشط</SelectItem>
        </SelectContent>
      </Select>

      <Select value={partnerFilter} onValueChange={onPartnerFilterChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="الشريك" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">الكل</SelectItem>
          {partners.map((partner) => (
            <SelectItem key={partner.id} value={partner.id}>
              {partner.name}
            </SelectItem>
          ))}
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

      <Button onClick={onCreateReward}>
        <Plus className="ml-2 size-4" />
        مكافأة جديدة
      </Button>
    </div>
  );
}
