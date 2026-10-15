import type { Booking, Customer, KpiData } from "./types";

export function extractFirstName(customerName: string): string {
  return customerName.split("،")[0].trim();
}

export function groupBookingsByPhone(bookings: Booking[]): Customer[] {
  const phoneMap = new Map<string, Booking[]>();

  bookings.forEach((booking) => {
    if (!phoneMap.has(booking.phone)) {
      phoneMap.set(booking.phone, []);
    }
    phoneMap.get(booking.phone)!.push(booking);
  });

  const customers: Customer[] = [];

  phoneMap.forEach((customerBookings, phone) => {
    const sortedBookings = customerBookings.sort((a, b) => {
      const dateA = new Date(a.trip_date);
      const dateB = new Date(b.trip_date);
      const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
      const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
      return timeB - timeA;
    });

    const latestBooking = sortedBookings[0];
    const customerName = extractFirstName(latestBooking.customer_name);
    const bookingsCount = customerBookings.length;
    const totalRevenue = customerBookings.reduce((sum, booking) => sum + booking.total_price, 0);

    customers.push({
      phone,
      customerName,
      bookingsCount,
      totalRevenue,
      latestBookingDate: latestBooking.trip_date,
      latestStatus: latestBooking.status,
      latestMeetingPlace: latestBooking.meeting_place,
      bookings: sortedBookings,
    });
  });

  return customers.sort((a, b) => {
    const dateA = new Date(a.latestBookingDate);
    const dateB = new Date(b.latestBookingDate);
    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
    return timeB - timeA;
  });
}

export function calculateKpis(bookings: Booking[], customers: Customer[]): KpiData {
  const totalCustomers = customers.length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0);
  const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return {
    totalCustomers,
    totalBookings,
    totalRevenue,
    averageBookingValue,
  };
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function filterCustomers(
  customers: Customer[],
  searchQuery: string,
  statusFilter: string,
  dateFilter: string,
): Customer[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      customer.customerName.includes(searchQuery) ||
      customer.phone.includes(searchQuery) ||
      customer.bookings.some((booking) => booking.ticket_number.includes(searchQuery));

    const matchesStatus = statusFilter === "all" || customer.latestStatus === statusFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const bookingDate = new Date(customer.latestBookingDate);
      if (!isNaN(bookingDate.getTime())) {
        switch (dateFilter) {
          case "today":
            matchesDate = bookingDate >= today;
            break;
          case "week":
            matchesDate = bookingDate >= weekAgo;
            break;
          case "month":
            matchesDate = bookingDate >= monthAgo;
            break;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
}

export function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const statusLower = status.toLowerCase();
  if (statusLower === "مؤكد" || statusLower === "مكتمل") {
    return "default";
  }
  if (statusLower === "ملغي") {
    return "destructive";
  }
  if (statusLower === "قيد الانتظار") {
    return "secondary";
  }
  return "outline";
}
