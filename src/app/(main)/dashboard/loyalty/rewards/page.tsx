"use client";

import { useEffect, useMemo, useState } from "react";

import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

import { PartnerCenter } from "./_components/partner-center";
import { QuickFilters } from "./_components/quick-filters";
import { RedemptionRequests } from "./_components/redemption-requests";
import { RewardCatalog } from "./_components/reward-catalog";
import { RewardFormModal } from "./_components/reward-form-modal";
import { RewardsAnalytics } from "./_components/rewards-analytics";
import { RewardsHero } from "./_components/rewards-hero";
import { SmartInsights } from "./_components/smart-insights";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reward form modal
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [rewardsRes, redemptionsRes, partnersRes] = await Promise.all([
        supabase.from("loyalty_rewards").select("*").order("display_order", { ascending: true }),
        supabase.from("loyalty_redemptions").select("*").order("created_at", { ascending: false }),
        supabase.from("loyalty_partners").select("*"),
      ]);

      if (rewardsRes.error) throw rewardsRes.error;
      if (redemptionsRes.error) throw redemptionsRes.error;
      if (partnersRes.error) throw partnersRes.error;

      setRewards(rewardsRes.data || []);
      setRedemptions(redemptionsRes.data || []);
      setPartners(partnersRes.data || []);
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

  const handleCreateReward = () => {
    setEditingReward(null);
    setShowRewardForm(true);
  };

  const handleEditReward = (reward: any) => {
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const handleRewardSaved = () => {
    setShowRewardForm(false);
    setEditingReward(null);
    fetchData();
  };

  const filteredRewards = useMemo(() => {
    return rewards.filter((r) => {
      const matchesSearch =
        r.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description_ar?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && r.is_active) ||
        (statusFilter === "inactive" && !r.is_active);
      const matchesPartner = partnerFilter === "all" || r.partner_id === partnerFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesPartner;
    });
  }, [rewards, searchQuery, categoryFilter, statusFilter, partnerFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      <RewardsHero />

      <QuickFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        partnerFilter={partnerFilter}
        onPartnerFilterChange={setPartnerFilter}
        partners={partners}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onCreateReward={handleCreateReward}
      />

      <RewardCatalog rewards={filteredRewards} loading={loading} onEdit={handleEditReward} onRefresh={fetchData} />

      <RedemptionRequests redemptions={redemptions} loading={loading} onRefresh={fetchData} />

      <PartnerCenter partners={partners} loading={loading} onRefresh={fetchData} />

      <RewardsAnalytics rewards={rewards} redemptions={redemptions} loading={loading} />

      <SmartInsights rewards={rewards} redemptions={redemptions} loading={loading} />

      <RewardFormModal
        open={showRewardForm}
        onOpenChange={setShowRewardForm}
        reward={editingReward}
        partners={partners}
        onSave={handleRewardSaved}
      />
    </div>
  );
}
