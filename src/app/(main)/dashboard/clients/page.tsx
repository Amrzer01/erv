"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

import { ClientsTable } from "./_components/clients-table";
import { ClientsToolbar } from "./_components/clients-toolbar";
import { KpiCards } from "./_components/kpi-cards";
import type { Booking, Customer, KpiData } from "./_components/types";
import { calculateKpis, filterCustomers, groupBookingsByPhone } from "./_components/utils";

export default function ClientsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [kpiData, setKpiData] = useState<KpiData>({
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageBookingValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = filterCustomers(customers, searchQuery, statusFilter, dateFilter);

  const pageSize = 25;
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  const availableStatuses = Array.from(new Set(customers.map((c) => c.latestStatus)));

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) {
      const groupedCustomers = groupBookingsByPhone(bookings);
      setCustomers(groupedCustomers);
      setKpiData(calculateKpis(bookings, groupedCustomers));
    }
  }, [bookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  const handleViewCustomer = (customer: Customer) => {
    router.push(`/dashboard/clients/${customer.phone}`);
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  const handleBookingUpdate = (updatedBooking: Booking) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking)),
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">العملاء</h1>
        <p className="text-muted-foreground text-sm">إدارة جميع العملاء المستخرجين من الحجوزات.</p>
      </div>

      <KpiCards kpiData={kpiData} />

      <ClientsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onRefresh={handleRefresh}
        availableStatuses={availableStatuses}
      />

      <ClientsTable
        customers={filteredCustomers}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={handleViewCustomer}
        onRetry={handleRefresh}
        onBookingUpdate={handleBookingUpdate}
      />
    </div>
  );
}
