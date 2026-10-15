export interface PotentialClient {
  id: string;
  phone: string;
  customer_name: string;
  booking_probability: number;
  stage: string;
  summary: string | null;
  last_message: string | null;
  booking_category: string | null;
  expected_passengers: number | null;
  expected_trip_date: string | null;
  status: string;
  follow_up_count: number;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface KpiData {
  totalLeads: number;
  averageProbability: number;
  hotLeads: number;
  needsFollowUp: number;
  autoFollowedToday: number;
  averageLastResponseTime: string;
}

export interface ProbabilityDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface TopLead {
  id: string;
  customer_name: string;
  booking_probability: number;
  booking_category: string | null;
}

export type QuickFilter = "all" | "hot" | "this_week" | "needs_follow_up" | "auto_followed" | "low_probability";

export type SortField =
  | "customer_name"
  | "booking_probability"
  | "expected_trip_date"
  | "last_message_at"
  | "follow_up_count";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  searchQuery: string;
  probabilityRange: string;
  status: string;
  stage: string;
  bookingCategory: string;
  dateRange: string;
  followUpCount: string;
}
