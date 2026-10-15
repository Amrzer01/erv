"use client";

import { useEffect, useMemo, useState } from "react";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import { CustomerProfileDrawer } from "./_components/customer-profile-drawer";
import { EmployeeQuickActions } from "./_components/employee-quick-actions";
import { QuickFilters } from "./_components/quick-filters";
import { ReferralDetailsDrawer } from "./_components/referral-details-drawer";
import { ReferralFunnel } from "./_components/referral-funnel";
import { ReferralTable } from "./_components/referral-table";
import { ReferralsAnalytics } from "./_components/referrals-analytics";
import { ReferralsHero } from "./_components/referrals-hero";
import { ReferralsKpiCards } from "./_components/referrals-kpi-cards";
import { ReferralsLeaderboard } from "./_components/referrals-leaderboard";
import { SmartInsights } from "./_components/smart-insights";

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drawer states
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [showReferralDrawer, setShowReferralDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rewardFilter, setRewardFilter] = useState<string>("all");
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [referralsRes, accountsRes, transactionsRes] = await Promise.all([
        supabase.from("loyalty_referrals").select("*").order("created_at", { ascending: false }),
        supabase.from("loyalty_accounts").select("*"),
        supabase.from("loyalty_transactions").select("*").eq("source", "referral"),
      ]);

      if (referralsRes.error) throw referralsRes.error;
      if (accountsRes.error) throw accountsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setReferrals(referralsRes.data || []);
      setAccounts(accountsRes.data || []);
      setTransactions(transactionsRes.data || []);
    } catch (err) {
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast.success("تم تحديث البيانات");
  };

  const handleViewReferral = (referral: any) => {
    setSelectedReferral(referral);
    setShowReferralDrawer(true);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDrawer(true);
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const matchesSearch =
        r.referrer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.referrer_phone?.includes(searchQuery) ||
        r.referred_phone?.includes(searchQuery) ||
        r.id?.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesReward =
        rewardFilter === "all" ||
        (rewardFilter === "rewarded" && r.rewarded) ||
        (rewardFilter === "not_rewarded" && !r.rewarded);
      const matchesBooking =
        bookingFilter === "all" ||
        (bookingFilter === "completed" && r.booking_completed) ||
        (bookingFilter === "not_completed" && !r.booking_completed);

      const account = accounts.find((a) => a.phone === r.referrer_phone);
      const matchesTier = tierFilter === "all" || (account && account.loyalty_tier === tierFilter);

      return matchesSearch && matchesStatus && matchesReward && matchesBooking && matchesTier;
    });
  }, [referrals, accounts, searchQuery, statusFilter, rewardFilter, bookingFilter, tierFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      <ReferralsHero />

      <ReferralsKpiCards referrals={referrals} accounts={accounts} transactions={transactions} loading={loading} />

      <ReferralsAnalytics referrals={referrals} transactions={transactions} loading={loading} />

      <ReferralsLeaderboard accounts={accounts} loading={loading} onViewCustomer={handleViewCustomer} />

      <QuickFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        rewardFilter={rewardFilter}
        onRewardFilterChange={setRewardFilter}
        bookingFilter={bookingFilter}
        onBookingFilterChange={setBookingFilter}
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <EmployeeQuickActions referrals={referrals} onViewReferral={handleViewReferral} />

      <ReferralTable
        referrals={filteredReferrals}
        accounts={accounts}
        loading={loading}
        onViewReferral={handleViewReferral}
        onViewCustomer={handleViewCustomer}
      />

      <ReferralFunnel referrals={referrals} loading={loading} />

      <SmartInsights referrals={referrals} accounts={accounts} transactions={transactions} loading={loading} />

      <ReferralDetailsDrawer
        referral={selectedReferral}
        account={selectedReferral ? accounts.find((a) => a.phone === selectedReferral.referrer_phone) : null}
        open={showReferralDrawer}
        onOpenChange={setShowReferralDrawer}
      />

      <CustomerProfileDrawer
        customer={selectedCustomer}
        open={showCustomerDrawer}
        onOpenChange={setShowCustomerDrawer}
      />
    </div>
  );
}
