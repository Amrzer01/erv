export interface Booking {
  id: string;
  ticket_number: string;
  customer_name: string;
  phone: string;
  booking_category: string;
  passengers: string;
  room_details: string;
  total_price: number;
  trip_date: string;
  meeting_place: string;
  ticket_issue_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Customer {
  phone: string;
  customerName: string;
  bookingsCount: number;
  totalRevenue: number;
  latestBookingDate: string;
  latestStatus: string;
  latestMeetingPlace: string;
  bookings: Booking[];
}

export interface KpiData {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export type StatusFilter = "all" | string;
export type DateFilter = "all" | "today" | "week" | "month" | "custom";
