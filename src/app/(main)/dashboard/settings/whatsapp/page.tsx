"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";

import { AccountDetailsDrawer } from "./_components/account-details-drawer";
import { AccountsTable } from "./_components/accounts-table";
import { DeleteAccountDialog } from "./_components/delete-account-dialog";
import { KpiCards } from "./_components/kpi-cards";
import { PageHeader } from "./_components/page-header";
import { PromptCards } from "./_components/prompt-cards";
import { PromptEditorDialog } from "./_components/prompt-editor-dialog";
import type { Account, AccountStats, BotSettings } from "./_components/types";
import { calculateAccountStats } from "./_components/utils";

export default function WhatsAppSettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [botSettings, setBotSettings] = useState<BotSettings | null>(null);
  const [stats, setStats] = useState<AccountStats>({
    totalAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [promptEditorOpen, setPromptEditorOpen] = useState(false);
  const [promptEditorType, setPromptEditorType] = useState<"system" | "pre_trip" | "during_trip" | "post_trip">(
    "system",
  );

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchBotSettings = async () => {
    try {
      setSettingsLoading(true);

      const { data, error: fetchError } = await supabase.from("bot_settings").select("*").single();

      if (fetchError) throw fetchError;

      setBotSettings(data);
    } catch (err) {
      console.error("Failed to fetch bot settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBotSettings();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      setStats(calculateAccountStats(accounts));
    }
  }, [accounts]);

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setDrawerOpen(true);
  };

  const handleDeleteAccount = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      setIsDeleting(true);

      const { error: deleteError } = await supabase.from("accounts").delete().eq("id", accountToDelete.id);

      if (deleteError) throw deleteError;

      toast.success("تم حذف الحساب بنجاح");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      await fetchAccounts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavePrompt = async (prompt: string, type: "system" | "pre_trip" | "during_trip" | "post_trip") => {
    try {
      setIsSaving(true);

      if (!botSettings) {
        toast.error("لم يتم العثور على إعدادات البوت");
        return;
      }

      const columnMap = {
        system: "system_prompt",
        pre_trip: "pre_trip_system_prompt",
        during_trip: "during_trip_system_prompt",
        post_trip: "post_trip_system_prompt",
      };

      const { error: updateError } = await supabase
        .from("bot_settings")
        .update({ [columnMap[type]]: prompt })
        .eq("id", botSettings.id);

      if (updateError) throw updateError;

      toast.success("تم حفظ التعليمات بنجاح");
      await fetchBotSettings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save prompt");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAccounts();
    fetchBotSettings();
  };

  const handlePromptExpand = (type: "system" | "pre_trip" | "during_trip" | "post_trip") => {
    setPromptEditorType(type);
    setPromptEditorOpen(true);
  };

  const getPromptConfig = (type: "system" | "pre_trip" | "during_trip" | "post_trip") => {
    const configs = {
      system: { title: "الحجز", description: "يستخدم عند التحدث مع أي عميل لم يقم بالحجز بعد." },
      pre_trip: { title: "قبل الرحلة", description: "يستخدم بعد إنشاء التذكرة وحتى بداية الرحلة." },
      during_trip: { title: "أثناء الرحلة", description: "يستخدم أثناء وجود العميل في رحلة العمرة." },
      post_trip: { title: "بعد الرحلة", description: "يستخدم بعد انتهاء الرحلة لمتابعة العميل والعروض المستقبلية." },
    };
    return configs[type];
  };

  const getPromptValue = (type: "system" | "pre_trip" | "during_trip" | "post_trip") => {
    if (!botSettings) return "";
    const valueMap = {
      system: botSettings.system_prompt,
      pre_trip: botSettings.pre_trip_system_prompt,
      during_trip: botSettings.during_trip_system_prompt,
      post_trip: botSettings.post_trip_system_prompt,
    };
    return valueMap[type] || "";
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <PageHeader />

      <KpiCards stats={stats} />

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">الحسابات المتصلة</h2>
          <AccountsTable
            accounts={accounts}
            loading={loading}
            error={error}
            onView={handleViewAccount}
            onDelete={handleDeleteAccount}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">تعليمات الذكاء الاصطناعي</h2>
          <PromptCards settings={botSettings} loading={settingsLoading} onExpand={handlePromptExpand} />
        </div>
      </div>

      <AccountDetailsDrawer account={selectedAccount} open={drawerOpen} onOpenChange={setDrawerOpen} />

      <DeleteAccountDialog
        account={accountToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <PromptEditorDialog
        open={promptEditorOpen}
        onOpenChange={setPromptEditorOpen}
        type={promptEditorType}
        title={getPromptConfig(promptEditorType).title}
        description={getPromptConfig(promptEditorType).description}
        initialPrompt={getPromptValue(promptEditorType)}
        lastUpdated={botSettings?.updated_at || new Date().toISOString()}
        createdAt={botSettings?.created_at || new Date().toISOString()}
        onSave={(prompt) => handleSavePrompt(prompt, promptEditorType)}
      />
    </div>
  );
}
