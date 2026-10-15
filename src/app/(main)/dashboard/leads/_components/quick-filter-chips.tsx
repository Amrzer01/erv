"use client";

import { Button } from "@/components/ui/button";

import type { QuickFilter } from "./types";

interface QuickFilterChipsProps {
  activeFilter: QuickFilter;
  onFilterChange: (filter: QuickFilter) => void;
}

const filters: { value: QuickFilter; label: string; icon: string }[] = [
  { value: "all", label: "الكل", icon: "📋" },
  { value: "hot", label: "الأعلى جاهزية", icon: "🔥" },
  { value: "this_week", label: "رحلة هذا الأسبوع", icon: "📅" },
  { value: "needs_follow_up", label: "يحتاج متابعة", icon: "⏰" },
  { value: "auto_followed", label: "تمت متابعته تلقائياً", icon: "🤖" },
  { value: "low_probability", label: "منخفض الاحتمال", icon: "❌" },
];

export function QuickFilterChips({ activeFilter, onFilterChange }: QuickFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="gap-2"
        >
          <span>{filter.icon}</span>
          <span>{filter.label}</span>
        </Button>
      ))}
    </div>
  );
}
