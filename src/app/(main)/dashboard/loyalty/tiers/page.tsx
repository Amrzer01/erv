"use client";

import { useEffect, useMemo, useState } from "react";

import { Filter, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount, LoyaltyTier } from "../_components/types";
import { AutomaticUpgradeRules } from "./_components/automatic-upgrade-rules";
import { DigitalLoyaltyCard } from "./_components/digital-loyalty-card";
import { LoyaltyHealth } from "./_components/loyalty-health";
import { SmartInsights } from "./_components/smart-insights";
import { TierComparisonCards } from "./_components/tier-comparison-cards";
import { TierDistributionChart } from "./_components/tier-distribution-chart";
import { TierKpiCards } from "./_components/tier-kpi-cards";
import { TierRequirementsTimeline } from "./_components/tier-requirements-timeline";
import { TierStatistics } from "./_components/tier-statistics";
import { TiersHero } from "./_components/tiers-hero";
import { UpgradeOpportunities } from "./_components/upgrade-opportunities";

export default function TiersPage() {
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<LoyaltyTier | "all">("all");
  const [minPointsFilter, setMinPointsFilter] = useState<number>(0);
  const [minBookingsFilter, setMinBookingsFilter] = useState<number>(0);
  const [lastActivityFilter, setLastActivityFilter] = useState<string>("all");

  const fetchLoyaltyAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("loyalty_accounts")
        .select("*")
        .order("total_spent", { ascending: false });

      if (error) throw error;
      setLoyaltyAccounts(data || []);
    } catch (err) {
      toast.error("فشل تحميل بيانات الولاء");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLoyaltyAccounts();
    toast.success("تم تحديث البيانات");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setTierFilter("all");
    setMinPointsFilter(0);
    setMinBookingsFilter(0);
    setLastActivityFilter("all");
  };

  const filteredAccounts = useMemo(() => {
    return loyaltyAccounts.filter((account) => {
      // Search filter
      const matchesSearch =
        account.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || account.phone.includes(searchQuery);

      // Tier filter
      const matchesTier = tierFilter === "all" || account.loyalty_tier === tierFilter;

      // Minimum points filter
      const matchesPoints = account.total_points >= minPointsFilter;

      // Minimum bookings filter
      const matchesBookings = account.bookings_count >= minBookingsFilter;

      // Last activity filter
      let matchesActivity = true;
      if (lastActivityFilter !== "all") {
        const daysSinceActivity = Math.floor(
          (Date.now() - new Date(account.last_activity_at).getTime()) / (1000 * 60 * 60 * 24),
        );
        if (lastActivityFilter === "30") {
          matchesActivity = daysSinceActivity <= 30;
        } else if (lastActivityFilter === "90") {
          matchesActivity = daysSinceActivity <= 90;
        } else if (lastActivityFilter === "180") {
          matchesActivity = daysSinceActivity <= 180;
        }
      }

      return matchesSearch && matchesTier && matchesPoints && matchesBookings && matchesActivity;
    });
  }, [loyaltyAccounts, searchQuery, tierFilter, minPointsFilter, minBookingsFilter, lastActivityFilter]);

  useEffect(() => {
    fetchLoyaltyAccounts();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <TiersHero />
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`ml-2 size-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "جاري التحديث..." : "تحديث"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-muted rounded-xl">
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

        <Select value={minPointsFilter.toString()} onValueChange={(v) => setMinPointsFilter(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحد الأدنى للنقاط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">الكل</SelectItem>
            <SelectItem value="1000">1000+</SelectItem>
            <SelectItem value="5000">5000+</SelectItem>
            <SelectItem value="10000">10000+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={minBookingsFilter.toString()} onValueChange={(v) => setMinBookingsFilter(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="الحد الأدنى للحجوزات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">الكل</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={lastActivityFilter} onValueChange={setLastActivityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="آخر نشاط" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="30">آخر 30 يوم</SelectItem>
            <SelectItem value="90">آخر 90 يوم</SelectItem>
            <SelectItem value="180">آخر 180 يوم</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleResetFilters}>
          <Filter className="ml-2 size-4" />
          إعادة تعيين
        </Button>
      </div>

      <TierKpiCards accounts={filteredAccounts} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TierDistributionChart accounts={filteredAccounts} loading={loading} />
        </div>
        <TierStatistics accounts={filteredAccounts} loading={loading} />
      </div>

      <TierComparisonCards accounts={filteredAccounts} loading={loading} />

      <UpgradeOpportunities accounts={filteredAccounts} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DigitalLoyaltyCard accounts={filteredAccounts} loading={loading} />
        <TierRequirementsTimeline />
      </div>

      <AutomaticUpgradeRules />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoyaltyHealth accounts={filteredAccounts} loading={loading} />
        <SmartInsights accounts={filteredAccounts} loading={loading} />
      </div>
    </div>
  );
}
