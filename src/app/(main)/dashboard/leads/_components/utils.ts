import type {
  CategoryDistribution,
  FilterState,
  KpiData,
  PotentialClient,
  ProbabilityDistribution,
  QuickFilter,
  SortField,
  SortOrder,
  TopLead,
} from "./types";

export function calculateKpis(leads: PotentialClient[]): KpiData {
  const totalLeads = leads.length;
  const averageProbability =
    totalLeads > 0 ? leads.reduce((sum, lead) => sum + lead.booking_probability, 0) / totalLeads : 0;
  const hotLeads = leads.filter((lead) => lead.booking_probability >= 80).length;

  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const needsFollowUp = leads.filter((lead) => {
    if (!lead.last_message_at) return false;
    const lastMessage = new Date(lead.last_message_at);
    return lastMessage < fiveMinutesAgo;
  }).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const autoFollowedToday = leads.filter((lead) => {
    const updated = new Date(lead.updated_at);
    return updated >= today && lead.follow_up_count > 0;
  }).length;

  const averageLastResponseTime = calculateAverageResponseTime(leads);

  return {
    totalLeads,
    averageProbability: Math.round(averageProbability),
    hotLeads,
    needsFollowUp,
    autoFollowedToday,
    averageLastResponseTime,
  };
}

function calculateAverageResponseTime(leads: PotentialClient[]): string {
  const leadsWithTime = leads.filter((lead) => lead.last_message_at && lead.created_at);
  if (leadsWithTime.length === 0) return "0 دقيقة";

  const totalMinutes = leadsWithTime.reduce((sum, lead) => {
    const created = new Date(lead.created_at).getTime();
    const lastMessage = new Date(lead.last_message_at!).getTime();
    return sum + (lastMessage - created) / (1000 * 60);
  }, 0);

  const avgMinutes = totalMinutes / leadsWithTime.length;

  if (avgMinutes < 60) {
    return `${Math.round(avgMinutes)} دقيقة`;
  }
  if (avgMinutes < 1440) {
    return `${Math.round(avgMinutes / 60)} ساعة`;
  }
  return `${Math.round(avgMinutes / 1440)} يوم`;
}

export function getProbabilityDistribution(leads: PotentialClient[]): ProbabilityDistribution[] {
  const ranges = [
    { range: "0-25%", min: 0, max: 25 },
    { range: "26-50%", min: 26, max: 50 },
    { range: "51-75%", min: 51, max: 75 },
    { range: "76-100%", min: 76, max: 100 },
  ];

  return ranges.map(({ range, min, max }) => {
    const count = leads.filter((lead) => lead.booking_probability >= min && lead.booking_probability <= max).length;
    return {
      range,
      count,
      percentage: leads.length > 0 ? Math.round((count / leads.length) * 100) : 0,
    };
  });
}

export function getCategoryDistribution(leads: PotentialClient[]): CategoryDistribution[] {
  const categoryMap = new Map<string, number>();

  leads.forEach((lead) => {
    if (lead.booking_category) {
      categoryMap.set(lead.booking_category, (categoryMap.get(lead.booking_category) || 0) + 1);
    }
  });

  const total = leads.length;
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getTopLeads(leads: PotentialClient[], limit = 10): TopLead[] {
  return leads
    .sort((a, b) => b.booking_probability - a.booking_probability)
    .slice(0, limit)
    .map((lead) => ({
      id: lead.id,
      customer_name: lead.customer_name,
      booking_probability: lead.booking_probability,
      booking_category: lead.booking_category,
    }));
}

export function filterLeads(
  leads: PotentialClient[],
  filters: FilterState,
  quickFilter: QuickFilter,
): PotentialClient[] {
  let filtered = [...leads];

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (lead) =>
        lead.customer_name.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        (lead.summary && lead.summary.toLowerCase().includes(query)) ||
        (lead.last_message && lead.last_message.toLowerCase().includes(query)),
    );
  }

  if (filters.probabilityRange !== "all") {
    const [min, max] = filters.probabilityRange.split("-").map(Number);
    filtered = filtered.filter((lead) => lead.booking_probability >= min && lead.booking_probability <= max);
  }

  if (filters.status !== "all") {
    filtered = filtered.filter((lead) => lead.status === filters.status);
  }

  if (filters.stage !== "all") {
    filtered = filtered.filter((lead) => lead.stage === filters.stage);
  }

  if (filters.bookingCategory !== "all") {
    filtered = filtered.filter((lead) => lead.booking_category === filters.bookingCategory);
  }

  if (filters.dateRange !== "all") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;

    switch (filters.dateRange) {
      case "today":
        startDate = today;
        break;
      case "week":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    filtered = filtered.filter((lead) => new Date(lead.created_at) >= startDate);
  }

  if (filters.followUpCount !== "all") {
    const [min, max] = filters.followUpCount.split("-").map(Number);
    filtered = filtered.filter((lead) => lead.follow_up_count >= min && lead.follow_up_count <= max);
  }

  // Apply quick filter
  if (quickFilter !== "all") {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    switch (quickFilter) {
      case "hot":
        filtered = filtered.filter((lead) => lead.booking_probability >= 80);
        break;
      case "this_week":
        filtered = filtered.filter((lead) => {
          if (!lead.expected_trip_date) return false;
          const tripDate = new Date(lead.expected_trip_date);
          return tripDate >= today && tripDate <= weekEnd;
        });
        break;
      case "needs_follow_up":
        filtered = filtered.filter((lead) => {
          if (!lead.last_message_at) return true;
          return new Date(lead.last_message_at) < fiveMinutesAgo;
        });
        break;
      case "auto_followed":
        filtered = filtered.filter((lead) => {
          const updated = new Date(lead.updated_at);
          return updated >= today && lead.follow_up_count > 0;
        });
        break;
      case "low_probability":
        filtered = filtered.filter((lead) => lead.booking_probability < 40);
        break;
    }
  }

  return filtered;
}

export function sortLeads(leads: PotentialClient[], field: SortField, order: SortOrder): PotentialClient[] {
  return [...leads].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "customer_name":
        comparison = a.customer_name.localeCompare(b.customer_name, "ar");
        break;
      case "booking_probability":
        comparison = a.booking_probability - b.booking_probability;
        break;
      case "expected_trip_date": {
        const dateA = a.expected_trip_date ? new Date(a.expected_trip_date).getTime() : 0;
        const dateB = b.expected_trip_date ? new Date(b.expected_trip_date).getTime() : 0;
        comparison = dateA - dateB;
        break;
      }
      case "last_message_at": {
        const msgA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const msgB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        comparison = msgA - msgB;
        break;
      }
      case "follow_up_count":
        comparison = a.follow_up_count - b.follow_up_count;
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "الآن";
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;

  return formatDate(dateString);
}

export function getProbabilityColor(probability: number): string {
  if (probability >= 90) return "text-green-600 bg-green-50 border-green-200";
  if (probability >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
  if (probability >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getProbabilityBadgeColor(probability: number): "default" | "secondary" | "destructive" | "outline" {
  if (probability >= 90) return "default";
  if (probability >= 70) return "secondary";
  if (probability >= 40) return "outline";
  return "destructive";
}

export function getFollowUpStatus(lead: PotentialClient): string {
  const now = new Date();
  const lastMessage = lead.last_message_at ? new Date(lead.last_message_at) : new Date(lead.created_at);
  const minutesSinceLastMessage = (now.getTime() - lastMessage.getTime()) / (1000 * 60);

  if (minutesSinceLastMessage < 5) {
    return "بانتظار 5 دقائق";
  }
  if (lead.follow_up_count === 1) {
    return "تم إرسال أول متابعة";
  }
  if (lead.follow_up_count === 2) {
    return "تم إرسال ثاني متابعة";
  }
  if (minutesSinceLastMessage < 60) {
    return "بانتظار ساعة";
  }
  if (lead.follow_up_count >= 3) {
    return "تم إرسال آخر متابعة";
  }

  return "يحتاج متابعة";
}

export function getFollowUpStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status.includes("بانتظار")) return "outline";
  if (status.includes("تم إرسال")) return "default";
  return "secondary";
}

export function getAvailableStages(leads: PotentialClient[]): string[] {
  return Array.from(new Set(leads.map((lead) => lead.stage))).sort();
}

export function getAvailableStatuses(leads: PotentialClient[]): string[] {
  return Array.from(new Set(leads.map((lead) => lead.status))).sort();
}

export function getAvailableCategories(leads: PotentialClient[]): string[] {
  return Array.from(new Set(leads.map((lead) => lead.booking_category).filter(Boolean))).sort();
}

export function extractFirstName(customerName: string): string {
  return customerName.split("،")[0].trim();
}

export function generateTimeline(lead: PotentialClient): Array<{ label: string; completed: boolean; time?: string }> {
  const timeline = [{ label: "بدأ المحادثة", completed: true, time: formatDateTime(lead.created_at) }];

  if (lead.customer_name) {
    timeline.push({ label: "جمع البيانات", completed: true });
  }

  if (lead.booking_category) {
    timeline.push({ label: "اقترح البرنامج", completed: true });
  }

  if (lead.summary) {
    timeline.push({ label: "تحليل الاحتياجات", completed: true });
  }

  if (lead.last_message) {
    timeline.push({
      label: "آخر رد",
      completed: true,
      time: lead.last_message_at ? formatDateTime(lead.last_message_at) : undefined,
    });
  }

  for (let i = 1; i <= lead.follow_up_count; i++) {
    timeline.push({ label: `متابعة تلقائية #${i}`, completed: true });
  }

  const now = new Date();
  const lastMessage = lead.last_message_at ? new Date(lead.last_message_at) : new Date(lead.created_at);
  const minutesSinceLastMessage = (now.getTime() - lastMessage.getTime()) / (1000 * 60);

  if (minutesSinceLastMessage >= 5 && lead.follow_up_count === 0) {
    timeline.push({ label: "متابعة تلقائية #1", completed: false });
  } else if (minutesSinceLastMessage >= 60 && lead.follow_up_count === 1) {
    timeline.push({ label: "متابعة تلقائية #2", completed: false });
  } else if (minutesSinceLastMessage >= 1440 && lead.follow_up_count === 2) {
    timeline.push({ label: "متابعة تلقائية #3", completed: false });
  }

  return timeline;
}
