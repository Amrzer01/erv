import type { Account, AccountStats, AccountStatus } from "./types";

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return formatDate(dateString);
}

export function getStatusBadgeVariant(status: AccountStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "متصل") return "default";
  return "secondary";
}

export function getStatusColor(status: AccountStatus): string {
  if (status === "متصل") return "text-green-600";
  return "text-gray-600";
}

export function getStatusBgColor(status: AccountStatus): string {
  if (status === "متصل") return "bg-green-50";
  return "bg-gray-50";
}

export function getStatusBorderColor(status: AccountStatus): string {
  if (status === "متصل") return "border-green-200";
  return "border-gray-200";
}

export function getStatusLabel(status: AccountStatus): string {
  if (status === "متصل") return "متصل";
  return "غير متصل";
}

export function calculateAccountStats(accounts: Account[]): AccountStats {
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.status === "متصل").length;
  const inactiveAccounts = accounts.filter((a) => a.status !== "متصل").length;

  const lastUpdated =
    accounts.length > 0
      ? accounts.reduce((latest, acc) => (new Date(acc.updated_at) > new Date(latest.updated_at) ? acc : latest))
          .updated_at
      : new Date().toISOString();

  return {
    totalAccounts,
    activeAccounts,
    inactiveAccounts,
    lastUpdated,
  };
}

export function filterAccounts(accounts: Account[], searchQuery: string): Account[] {
  if (!searchQuery.trim()) return accounts;

  const query = searchQuery.toLowerCase();
  return accounts.filter(
    (account) => account.display_name.toLowerCase().includes(query) || account.safe_id.toLowerCase().includes(query),
  );
}

export function sortAccounts(accounts: Account[], field: keyof Account, order: "asc" | "desc"): Account[] {
  return [...accounts].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}
