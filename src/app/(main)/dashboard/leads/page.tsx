"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { BookingCategoryChart } from "./_components/booking-category-chart";
import { BookingProbabilityChart } from "./_components/booking-probability-chart";
import { FollowUpStatusCards } from "./_components/follow-up-status-cards";
import { HeroHeader } from "./_components/hero-header";
import { KpiCards } from "./_components/kpi-cards";
import { LeadDetailsDrawer } from "./_components/lead-details-drawer";
import { LeadsTable } from "./_components/leads-table";
import { LeadsToolbar } from "./_components/leads-toolbar";
import { ProbabilityDistributionChart } from "./_components/probability-distribution-chart";
import { QuickFilterChips } from "./_components/quick-filter-chips";
import type { FilterState, KpiData, PotentialClient, QuickFilter, SortField, SortOrder } from "./_components/types";
import {
  calculateKpis,
  filterLeads,
  getAvailableCategories,
  getAvailableStages,
  getAvailableStatuses,
  getCategoryDistribution,
  getProbabilityDistribution,
  getTopLeads,
  sortLeads,
} from "./_components/utils";

export default function LeadsPage() {
  const [leads, setLeads] = useState<PotentialClient[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<PotentialClient[]>([]);
  const [kpiData, setKpiData] = useState<KpiData>({
    totalLeads: 0,
    averageProbability: 0,
    hotLeads: 0,
    needsFollowUp: 0,
    autoFollowedToday: 0,
    averageLastResponseTime: "0 دقيقة",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<PotentialClient | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    probabilityRange: "all",
    status: "all",
    stage: "all",
    bookingCategory: "all",
    dateRange: "all",
    followUpCount: "all",
  });

  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sortField, setSortField] = useState<SortField>("booking_probability");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const pageSize = 25;
  const totalPages = Math.ceil(filteredLeads.length / pageSize);

  const availableStages = getAvailableStages(leads);
  const availableStatuses = getAvailableStatuses(leads);
  const availableCategories = getAvailableCategories(leads);

  const probabilityDistribution = getProbabilityDistribution(leads);
  const categoryDistribution = getCategoryDistribution(leads);
  const topLeads = getTopLeads(leads, 10);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("potential_clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      setKpiData(calculateKpis(leads));
    }
  }, [leads]);

  useEffect(() => {
    let result = filterLeads(leads, filters, quickFilter);
    result = sortLeads(result, sortField, sortOrder);
    setFilteredLeads(result);
    setCurrentPage(1);
  }, [leads, filters, quickFilter, sortField, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeads();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setQuickFilter("all");
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLeads();
  };

  const handleViewLead = (lead: PotentialClient) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  const handleQuickFilterChange = (filter: QuickFilter) => {
    setQuickFilter(filter);
    setFilters({
      searchQuery: "",
      probabilityRange: "all",
      status: "all",
      stage: "all",
      bookingCategory: "all",
      dateRange: "all",
      followUpCount: "all",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <HeroHeader />

      <KpiCards kpiData={kpiData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProbabilityDistributionChart data={probabilityDistribution} />
        <BookingProbabilityChart data={topLeads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingCategoryChart data={categoryDistribution} />
        <FollowUpStatusCards leads={leads} />
      </div>

      <div className="space-y-4">
        <QuickFilterChips activeFilter={quickFilter} onFilterChange={handleQuickFilterChange} />

        <LeadsToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          availableStages={availableStages}
          availableStatuses={availableStatuses}
          availableCategories={availableCategories}
        />

        <LeadsTable
          leads={filteredLeads}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onView={handleViewLead}
          onRetry={handleRefresh}
        />
      </div>

      <LeadDetailsDrawer lead={selectedLead} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
