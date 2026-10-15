export interface Account {
  id: string;
  safe_id: string;
  display_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BotSettings {
  id: string;
  system_prompt: string;
  pre_trip_system_prompt: string;
  during_trip_system_prompt: string;
  post_trip_system_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  ticket_number: string;
  customer_name: string;
  phone: string;
  booking_category: string;
  passengers: number;
  room_details: string;
  total_price: number;
  trip_date: string;
  trip_end_date: string;
  meeting_place: string;
  ticket_issue_date: string;
  status: string;
  notes: string;
  created_at: string;
}

export interface PotentialClient {
  id: string;
  phone: string;
  customer_name: string;
  booking_probability: number;
  stage: string;
  summary: string;
  last_message: string;
  booking_category: string;
  expected_passengers: number;
  expected_trip_date: string;
  status: string;
  follow_up_count: number;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  next_follow_up_at: string;
  last_follow_up_at: string;
  follow_up_status: string;
  last_follow_up_message: string;
  takeover_state: "AI_ACTIVE" | "HUMAN_REQUESTED" | "ASSIGNED" | "HUMAN_ACTIVE" | "COMPLETED" | "CANCELLED";
  assigned_employee_id: string | null;
  takeover_employee_id: string | null;
  takeover_timestamp: string | null;
  whatsapp_account_id: string | null;
  takeover_released_by: string | null;
  takeover_released_at: string | null;
}

export interface CustomerFollowUp {
  id: string;
  phone: string;
  ticket_number: string;
  follow_up_type: string;
  event_name: string;
  scheduled_for: string;
  sent_at: string | null;
  status: "pending" | "in_progress" | "sent" | "failed" | "completed";
  last_message: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerServiceRequest {
  id: string;
  phone: string;
  ticket_number: string | null;
  customer_name: string | null;
  request_type: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  ai_summary: string | null;
  employee_notes: string | null;
  assigned_employee_id: string | null;
  takeover_employee_id: string | null;
  takeover_timestamp: string | null;
  takeover_released_by: string | null;
  takeover_released_at: string | null;
  created_by: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KpiData {
  potentialClients: number;
  scheduledFollowUps: number;
  openHumanRequests: number;
  todaysFollowUps: number;
  messagesSentToday: number;
  successRate: number;
}

export interface TimelineGroup {
  label: string;
  items: TimelineItem[];
}

export interface TimelineItem {
  id: string;
  time: string;
  customerName: string;
  phone: string;
  ticketNumber: string;
  event: string;
  type: "pre_trip" | "during_trip" | "after_sales" | "potential_client" | "human_support" | "completed" | "failed";
  status: string;
  scheduledFor: string;
}

export type KanbanStatus = "pending" | "in_progress" | "completed" | "failed";

export interface ConversationMessage {
  id: string;
  phone: string;
  whatsapp_account_id: string | null;
  direction: "incoming" | "outgoing";
  sender_type: "customer" | "bot" | "employee";
  employee_id: string | null;
  message_type: string;
  message_text: string;
  whatsapp_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  employee_id: string;
  type: "human_support_request" | "assignment" | "message" | "booking_conversion";
  title: string;
  message: string | null;
  phone: string | null;
  potential_client_id: string | null;
  customer_service_request_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  status: "active" | "pending" | "inactive" | "disabled";
  department: string | null;
  avatar_url: string | null;
}
