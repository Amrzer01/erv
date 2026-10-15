"use client";

import { useState } from "react";

import { Plus, RotateCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BookingCreateDialog } from "./booking-create-dialog";
import type { Booking } from "./types";

interface ClientsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onRefresh: () => void;
  availableStatuses: string[];
  onBookingCreated?: (newBooking: Booking) => void;
}

export function ClientsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  onRefresh,
  availableStatuses,
  onBookingCreated,
}: ClientsToolbarProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreated = (newBooking: Booking) => {
    onRefresh();
    if (onBookingCreated) {
      onBookingCreated(newBooking);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم، الهاتف، أو رقم التذكرة..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="التاريخ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التواريخ</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RotateCw className="ml-2 size-4" />
            تحديث
          </Button>
          <Button size="sm" variant="default" onClick={() => setIsCreateOpen(true)}>
            <Plus className="ml-2 size-4" />
            إضافة حجز جديد
          </Button>
        </div>
      </div>

      <BookingCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreated={handleCreated} />
    </>
  );
}
