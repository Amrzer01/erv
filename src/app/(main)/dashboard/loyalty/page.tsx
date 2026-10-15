"use client";

import { useEffect, useState } from "react";

import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { syncAllLoyaltyAccounts } from "@/lib/loyalty/sync";
import { supabase } from "@/lib/supabase/client";

import { BehavioralTriggers } from "./_components/behavioral-triggers";
import { LoyaltyCardDrawer } from "./_components/loyalty-card-drawer";
import { LoyaltyKpiCards } from "./_components/loyalty-kpi-cards";
import { LoyaltyTable } from "./_components/loyalty-table";
import { MonthlyAnalytics } from "./_components/monthly-analytics";
import { MonthlyWinner } from "./_components/monthly-winner";
import { PageHeader } from "./_components/page-header";
import { RewardsAnalytics } from "./_components/rewards-analytics";
import type { LoyaltyAccount } from "./_components/types";

export default function LoyaltyPage() {
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSynced, setHasSynced] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LoyaltyAccount | null>(null);
  const [showCardDrawer, setShowCardDrawer] = useState(false);

  const fetchLoyaltyAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("loyalty_accounts")
        .select("*")
        .order("total_spent", { ascending: false });

      if (fetchError) throw fetchError;

      setLoyaltyAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch loyalty accounts");
      toast.error("فشل تحميل بيانات الولاء");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await syncAllLoyaltyAccounts();

      if (result.errors.length > 0) {
        toast.warning(`تمت المزامنة مع ${result.errors.length} أخطاء`);
      } else {
        toast.success(`تمت مزامنة ${result.synced} حساب ولاء`);
      }

      // Reload data after sync
      await fetchLoyaltyAccounts();
    } catch (err) {
      toast.error("فشل مزامنة بيانات الولاء");
    } finally {
      setSyncing(false);
    }
  };

  const handleViewCard = (account: LoyaltyAccount) => {
    setSelectedAccount(account);
    setShowCardDrawer(true);
  };

  const handleAdjustPoints = (account: LoyaltyAccount) => {
    setSelectedAccount(account);
    // TODO: Open points adjustment dialog
    toast.info("ميزة تعديل النقاط قيد التطوير");
  };

  useEffect(() => {
    const initializePage = async () => {
      // Auto-sync on first load if not synced yet
      if (!hasSynced) {
        await handleSync();
        setHasSynced(true);
      } else {
        await fetchLoyaltyAccounts();
      }
    };

    initializePage();

    // Realtime subscription
    const channel = supabase
      .channel("loyalty_accounts_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "loyalty_accounts" }, () => {
        fetchLoyaltyAccounts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <PageHeader />
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          <RefreshCw className={`ml-2 size-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "جاري المزامنة..." : "مزامنة الولاء"}
        </Button>
      </div>
      <LoyaltyKpiCards accounts={loyaltyAccounts} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyAnalytics accounts={loyaltyAccounts} loading={loading} />
        </div>
        <MonthlyWinner accounts={loyaltyAccounts} loading={loading} />
      </div>
      <BehavioralTriggers accounts={loyaltyAccounts} loading={loading} />
      <RewardsAnalytics />
      <LoyaltyTable
        accounts={loyaltyAccounts}
        loading={loading}
        error={error}
        onRetry={fetchLoyaltyAccounts}
        onViewCard={handleViewCard}
        onAdjustPoints={handleAdjustPoints}
      />
      <LoyaltyCardDrawer account={selectedAccount} open={showCardDrawer} onOpenChange={setShowCardDrawer} />
    </div>
  );
}
