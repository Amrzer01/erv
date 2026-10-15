"use client";

import { useEffect, useMemo, useState } from "react";

import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import type { LoyaltyAccount } from "../../_components/types";
import { CustomerJourney } from "./_components/customer-journey";
import { LoyaltyRewards } from "./_components/loyalty-rewards";
import { ManualAdjustmentModal } from "./_components/manual-adjustment-modal";
import { PointsAnalytics } from "./_components/points-analytics";
import { PointsCalculator } from "./_components/points-calculator";
import { PointsHero } from "./_components/points-hero";
import { PointsKpiCards } from "./_components/points-kpi-cards";
import { QuickFilters } from "./_components/quick-filters";
import { RulesEngine } from "./_components/rules-engine";
import { SmartInsights } from "./_components/smart-insights";
import { TopCustomers } from "./_components/top-customers";
import { TransactionDrawer } from "./_components/transaction-drawer";
import { TransactionLedger } from "./_components/transaction-ledger";

export default function PointsPage() {
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Transaction drawer
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);

  // Manual adjustment modal
  const [showManualAdjustment, setShowManualAdjustment] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [accountsRes, transactionsRes] = await Promise.all([
        supabase.from("loyalty_accounts").select("*"),
        supabase.from("loyalty_transactions").select("*").order("created_at", { ascending: false }),
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (transactionsRes.error) throw transactionsRes.error;

      setLoyaltyAccounts(accountsRes.data || []);
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

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDrawer(true);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone?.includes(searchQuery) ||
        t.transaction_id?.toLowerCase().includes(searchQuery) ||
        t.ticket_id?.toLowerCase().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesSource = sourceFilter === "all" || t.source === sourceFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const now = new Date();
        const transactionDate = new Date(t.created_at);
        const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === "today") matchesDate = daysDiff <= 1;
        else if (dateFilter === "week") matchesDate = daysDiff <= 7;
        else if (dateFilter === "month") matchesDate = daysDiff <= 30;
        else if (dateFilter === "quarter") matchesDate = daysDiff <= 90;
      }

      return matchesSearch && matchesStatus && matchesType && matchesSource && matchesDate;
    });
  }, [transactions, searchQuery, dateFilter, statusFilter, typeFilter, sourceFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      <PointsHero accountsCount={loyaltyAccounts.length} transactionsCount={transactions.length} />

      <QuickFilters
        search_QUERY={searchQuery}
        onSearchChange={setSearchQuery}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <PointsKpiCards accounts={loyaltyAccounts} transactions={transactions} loading={loading} />

      <PointsAnalytics transactions={transactions} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RulesEngine />
        <PointsCalculator />
      </div>

      <LoyaltyRewards />

      <TransactionLedger
        transactions={filteredTransactions}
        loading={loading}
        onViewTransaction={handleViewTransaction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCustomers accounts={loyaltyAccounts} loading={loading} />
        <CustomerJourney accounts={loyaltyAccounts} />
      </div>

      <SmartInsights accounts={loyaltyAccounts} transactions={transactions} loading={loading} />

      {/* FAB for manual adjustment */}
      <Button
        onClick={() => setShowManualAdjustment(true)}
        size="lg"
        className="fixed bottom-8 left-8 rounded-full shadow-lg"
      >
        <Plus className="ml-2 size-5" />
        تعديل النقاط
      </Button>

      <TransactionDrawer
        transaction={selectedTransaction}
        open={showTransactionDrawer}
        onOpenChange={setShowTransactionDrawer}
      />

      <ManualAdjustmentModal open={showManualAdjustment} onOpenChange={setShowManualAdjustment} onSuccess={fetchData} />
    </div>
  );
}
