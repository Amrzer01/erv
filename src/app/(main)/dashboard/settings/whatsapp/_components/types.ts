export interface Account {
  id: string;
  safe_id: string;
  display_name: string;
  status: "active" | "inactive" | "disconnected" | string;
  created_at: string;
  updated_at: string;
}

export interface BotSettings {
  id: string;
  system_prompt: string | null;
  pre_trip_system_prompt: string | null;
  during_trip_system_prompt: string | null;
  post_trip_system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountStats {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  lastUpdated: string;
}

export type AccountStatus = "active" | "inactive" | "disconnected" | string;
