export interface LoyaltyAccount {
  id: string;
  customer_name: string;
  phone: string;
  bookings_count: number;
  total_spent: number;
  total_points: number;
  spent_points: number;
  available_points: number;
  loyalty_tier: "Silver" | "Gold" | "Platinum";
  last_trip_date: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export type LoyaltyTier = "Silver" | "Gold" | "Platinum";

export interface LoyaltySyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}
