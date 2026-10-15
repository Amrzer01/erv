import type {
  CustomerFollowUp,
  CustomerServiceRequest,
  KpiData,
  PotentialClient,
  TimelineGroup,
  TimelineItem,
} from "./types";

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

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ar-SA", {
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

export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(dateString: string): boolean {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return date >= startOfWeek && date <= endOfWeek;
}

export function getTimelineGroups(followUps: CustomerFollowUp[]): TimelineGroup[] {
  const today: TimelineItem[] = [];
  const tomorrow: TimelineItem[] = [];
  const thisWeek: TimelineItem[] = [];
  const future: TimelineItem[] = [];

  followUps.forEach((followUp) => {
    const item: TimelineItem = {
      id: followUp.id,
      time: formatTime(followUp.scheduled_for),
      customerName: followUp.event_name || "غير معروف",
      phone: followUp.phone,
      ticketNumber: followUp.ticket_number || "N/A",
      event: followUp.event_name || followUp.follow_up_type,
      type: getFollowUpType(followUp.follow_up_type),
      status: followUp.status,
      scheduledFor: followUp.scheduled_for,
    };

    if (isToday(followUp.scheduled_for)) {
      today.push(item);
    } else if (isTomorrow(followUp.scheduled_for)) {
      tomorrow.push(item);
    } else if (isThisWeek(followUp.scheduled_for)) {
      thisWeek.push(item);
    } else {
      future.push(item);
    }
  });

  const groups: TimelineGroup[] = [];
  if (today.length > 0) groups.push({ label: "اليوم", items: today });
  if (tomorrow.length > 0) groups.push({ label: "غداً", items: tomorrow });
  if (thisWeek.length > 0) groups.push({ label: "هذا الأسبوع", items: thisWeek });
  if (future.length > 0) groups.push({ label: "المستقبل", items: future });

  return groups;
}

function getFollowUpType(type: string): TimelineItem["type"] {
  const lowerType = type.toLowerCase();
  if (lowerType.includes("pre") || lowerType.includes("قبل")) return "pre_trip";
  if (lowerType.includes("during") || lowerType.includes("أثناء")) return "during_trip";
  if (lowerType.includes("post") || lowerType.includes("بعد")) return "after_sales";
  if (lowerType.includes("potential") || lowerType.includes("محتمل")) return "potential_client";
  if (lowerType.includes("human") || lowerType.includes("بشري")) return "human_support";
  return "pre_trip";
}

export function calculateKpiData(
  potentialClients: PotentialClient[],
  followUps: CustomerFollowUp[],
  serviceRequests: CustomerServiceRequest[],
): KpiData {
  const potentialClientsCount = potentialClients.length;
  const scheduledFollowUps = followUps.filter((f) => f.status === "pending").length;
  const openHumanRequests = serviceRequests.filter((r) => r.status === "open").length;
  const todaysFollowUps = followUps.filter((f) => isToday(f.scheduled_for)).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const messagesSentToday = followUps.filter(
    (f) => f.status === "sent" && f.sent_at && new Date(f.sent_at) >= today,
  ).length;

  const sentCount = followUps.filter((f) => f.status === "sent").length;
  const failedCount = followUps.filter((f) => f.status === "failed").length;
  const successRate = sentCount + failedCount > 0 ? (sentCount / (sentCount + failedCount)) * 100 : 0;

  return {
    potentialClients: potentialClientsCount,
    scheduledFollowUps,
    openHumanRequests,
    todaysFollowUps,
    messagesSentToday,
    successRate,
  };
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
    case "open":
      return "text-yellow-600";
    case "in_progress":
      return "text-blue-600";
    case "completed":
    case "resolved":
    case "sent":
      return "text-green-600";
    case "failed":
    case "closed":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
    case "open":
      return "bg-yellow-50";
    case "in_progress":
      return "bg-blue-50";
    case "completed":
    case "resolved":
    case "sent":
      return "bg-green-50";
    case "failed":
    case "closed":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
}

export function getStatusBorderColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
    case "open":
      return "border-yellow-200";
    case "in_progress":
      return "border-blue-200";
    case "completed":
    case "resolved":
    case "sent":
      return "border-green-200";
    case "failed":
    case "closed":
      return "border-red-200";
    default:
      return "border-gray-200";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "text-red-600";
    case "high":
      return "text-orange-600";
    case "medium":
      return "text-yellow-600";
    case "low":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
}

export function getPriorityBgColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "bg-red-50";
    case "high":
      return "bg-orange-50";
    case "medium":
      return "bg-yellow-50";
    case "low":
      return "bg-gray-50";
    default:
      return "bg-gray-50";
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority.toLowerCase()) {
    case "urgent":
      return "عاجل";
    case "high":
      return "عالي";
    case "medium":
      return "متوسط";
    case "low":
      return "منخفض";
    default:
      return priority;
  }
}

export function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "قيد الانتظار";
    case "in_progress":
      return "قيد التنفيذ";
    case "completed":
      return "مكتمل";
    case "resolved":
      return "تم الحل";
    case "sent":
      return "تم الإرسال";
    case "failed":
      return "فشل";
    case "open":
      return "مفتوح";
    case "closed":
      return "مغلق";
    default:
      return status;
  }
}

export function getStageBadgeVariant(stage: string): "default" | "secondary" | "destructive" | "outline" {
  switch (stage.toLowerCase()) {
    case "new":
    case "جديد":
      return "default";
    case "contacted":
    case "تم التواصل":
      return "secondary";
    case "qualified":
    case "مؤهل":
      return "outline";
    case "proposal":
    case "عرض":
      return "default";
    case "negotiation":
    case "تفاوض":
      return "secondary";
    case "closed":
    case "مغلق":
      return "destructive";
    default:
      return "outline";
  }
}

export function groupByKanbanStatus(followUps: CustomerFollowUp[]): Record<string, CustomerFollowUp[]> {
  return {
    pending: followUps.filter((f) => f.status === "pending"),
    in_progress: followUps.filter((f) => f.status === "in_progress"),
    completed: followUps.filter((f) => f.status === "completed"),
    failed: followUps.filter((f) => f.status === "failed"),
  };
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  if (phone.startsWith("+")) return phone;
  if (phone.startsWith("00")) return "+" + phone.slice(2);
  if (phone.length === 10 && phone.startsWith("0")) return "+966" + phone.slice(1);
  return phone;
}
