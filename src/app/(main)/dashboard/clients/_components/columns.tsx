"use client";

import { useState } from "react";

import { Eye, MoreHorizontal, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BookingEditDialog } from "./booking-edit-dialog";
import { BookingViewerDialog } from "./booking-viewer-dialog";
import type { Booking, Customer } from "./types";
import { formatDate, formatMoney, getStatusBadgeVariant } from "./utils";

interface ColumnsProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  onBookingUpdate: (updatedBooking: Booking) => void;
}

export function Columns({ customers, onView, onBookingUpdate }: ColumnsProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleViewBooking = (customer: Customer) => {
    const latestBooking = customer.bookings[0];
    setSelectedBooking(latestBooking);
    setDialogOpen(true);
  };

  const handleEditBooking = (customer: Customer) => {
    const latestBooking = customer.bookings[0];
    setSelectedBooking(latestBooking);
    setEditDialogOpen(true);
  };

  const handleBookingUpdate = (updatedBooking: Booking) => {
    onBookingUpdate(updatedBooking);
  };

  return (
    <>
      <BookingViewerDialog booking={selectedBooking} open={dialogOpen} onOpenChange={setDialogOpen} />
      <BookingEditDialog
        booking={selectedBooking}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleBookingUpdate}
      />
      {customers.map((customer) => (
        <tr key={customer.phone} className="border-b transition-colors hover:bg-muted/50">
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="font-medium">{customer.customerName}</div>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="text-muted-foreground">{customer.phone}</div>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="text-muted-foreground">{customer.bookingsCount.toLocaleString("ar-SA")}</div>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="font-medium">{formatMoney(customer.totalRevenue)}</div>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="text-muted-foreground">{formatDate(customer.latestBookingDate)}</div>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="text-muted-foreground text-sm">{customer.latestMeetingPlace}</div>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <Badge variant={getStatusBadgeVariant(customer.latestStatus)}>{customer.latestStatus}</Badge>
          </td>
          <td className="p-2 align-middle whitespace-nowrap">
            <div className="flex items-center gap-1">
              <Button size="icon-xs" variant="ghost" onClick={() => handleViewBooking(customer)}>
                <Eye className="size-3.5" />
              </Button>
              <Button size="icon-xs" variant="ghost" onClick={() => handleEditBooking(customer)}>
                <Pencil className="size-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-xs" variant="ghost">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(customer)}>عرض جميع الحجوزات</DropdownMenuItem>
                  <DropdownMenuItem>سجل الحجوزات</DropdownMenuItem>
                  <DropdownMenuItem>إرسال رسالة</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
