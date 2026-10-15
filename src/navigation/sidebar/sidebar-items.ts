import {
  Banknote,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Gauge,
  Gift,
  Headphones,
  HeartHandshake,
  Kanban,
  Layers,
  LayoutDashboard,
  Lock,
  type LucideIcon,
  Luggage,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  ReceiptText,
  Server,
  Settings,
  ShoppingBag,
  SquareArrowUpRight,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboard",
    items: [
      {
        id: "dashboard",
        title: "لوحة التحكم",
        url: "/dashboard/coming-soon",
        icon: LayoutDashboard,
        badge: "soon",
        disabled: true,
      },
    ],
  },
  {
    id: 2,
    label: "CRM",
    items: [
      {
        id: "crm",
        title: "CRM",
        icon: Users,
        subItems: [
          { id: "crm-clients", title: "العملاء", url: "/dashboard/clients" },
          { id: "crm-leads", title: "العملاء المحتملين", url: "/dashboard/leads" },
          { id: "crm-followup", title: "المتابعة", url: "/dashboard/follow-up" },
          { id: "crm-activities", title: "الأنشطة", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "crm-sales", title: "المبيعات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "crm-pipeline", title: "خط البيع", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "crm-tasks", title: "المهام", url: "/dashboard/tasks" },
          { id: "crm-calendar", title: "التقويم", url: "/dashboard/calendar" },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "إدارة المعتمرين",
    items: [
      {
        id: "umrah-management",
        title: "إدارة المعتمرين",
        icon: Luggage,
        subItems: [
          { id: "umrah-pilgrims", title: "المعتمرين", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-bookings", title: "الحجوزات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-programs", title: "البرامج", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-trips", title: "الرحلات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-hotels", title: "الفنادق", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-buses", title: "الباصات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-flights", title: "الطيران", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-guides", title: "المرافقين", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "umrah-invoices", title: "الفواتير", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
        ],
      },
    ],
  },
  {
    id: 4,
    label: "المحاسبة",
    items: [
      {
        id: "accounting",
        title: "المحاسبة",
        icon: Banknote,
        subItems: [
          { id: "acc-accounts", title: "الحسابات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-entries", title: "القيود اليومية", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-cash", title: "الصندوق", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-banks", title: "البنوك", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-receipts", title: "سندات القبض", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-payments", title: "سندات الصرف", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-debit-notes", title: "إشعار مدين", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "acc-credit-notes", title: "إشعار دائن", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          {
            id: "acc-cost-centers",
            title: "مراكز التكلفة",
            url: "/dashboard/coming-soon",
            badge: "soon",
            disabled: true,
          },
        ],
      },
    ],
  },
  {
    id: 5,
    label: "المخزون",
    items: [
      {
        id: "inventory",
        title: "المخزون",
        icon: Package,
        subItems: [
          { id: "inv-products", title: "المنتجات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "inv-warehouses", title: "المخازن", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "inv-suppliers", title: "الموردين", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "inv-purchases", title: "المشتريات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "inv-transfers", title: "التحويلات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "inv-stocktaking", title: "الجرد", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
        ],
      },
    ],
  },
  {
    id: 6,
    label: "الموارد البشرية",
    items: [
      {
        id: "hr",
        title: "الموارد البشرية",
        icon: UserCheck,
        subItems: [
          { id: "hr-employees", title: "الموظفين", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          {
            id: "hr-attendance",
            title: "الحضور والانصراف",
            url: "/dashboard/coming-soon",
            badge: "soon",
            disabled: true,
          },
          { id: "hr-salaries", title: "الرواتب", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "hr-leaves", title: "الإجازات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "hr-evaluation", title: "التقييم", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
        ],
      },
    ],
  },
  {
    id: 7,
    label: "التسويق",
    items: [
      {
        id: "marketing",
        title: "التسويق",
        icon: Megaphone,
        subItems: [
          { id: "mkt-campaigns", title: "الحملات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "mkt-leads", title: "العملاء المحتملين", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "mkt-content", title: "المحتوى", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "mkt-videos", title: "الفيديوهات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "mkt-mediabuyer", title: "Media Buyer", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "mkt-reports", title: "التقارير", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
        ],
      },
    ],
  },
  {
    id: 8,
    label: "الكول سنتر",
    items: [
      {
        id: "call-center",
        title: "الكول سنتر",
        icon: Headphones,
        subItems: [
          { id: "cc-dashboard", title: "لوحة التحكم", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "cc-calls", title: "المكالمات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "cc-ivr", title: "IVR", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "cc-recordings", title: "التسجيلات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "cc-agents", title: "الوكلاء", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "cc-quality", title: "الجودة", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
        ],
      },
    ],
  },
  {
    id: 9,
    label: "برنامج الولاء",
    items: [
      {
        id: "loyalty-program",
        title: "برنامج الولاء",
        icon: Gift,
        subItems: [
          {
            id: "loyalty-dashboard",
            title: "لوحة الولاء",
            url: "/dashboard/loyalty",
          },
          { id: "loyalty-levels", title: "المستويات", url: "/dashboard/loyalty/tiers" },
          { id: "loyalty-points", title: "النقاط", url: "/dashboard/loyalty/points" },
          { id: "loyalty-rewards", title: "المكافآت", url: "/dashboard/loyalty/rewards" },
          { id: "loyalty-referrals", title: "الإحالات", url: "/dashboard/loyalty/referrals" },
        ],
      },
    ],
  },
  {
    id: 10,
    label: "التقارير",
    items: [
      {
        id: "reports",
        title: "التقارير",
        icon: BarChart3,
        subItems: [
          { id: "rep-sales", title: "تقارير المبيعات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          {
            id: "rep-financial",
            title: "التقارير المالية",
            url: "/dashboard/coming-soon",
            badge: "soon",
            disabled: true,
          },
          {
            id: "rep-pilgrims",
            title: "تقارير المعتمرين",
            url: "/dashboard/coming-soon",
            badge: "soon",
            disabled: true,
          },
          { id: "rep-kpi", title: "KPI", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          {
            id: "rep-daily-closing",
            title: "كشف إقفال اليوم",
            url: "/dashboard/coming-soon",
            badge: "soon",
            disabled: true,
          },
        ],
      },
    ],
  },
  {
    id: 11,
    label: "الإعدادات",
    items: [
      {
        id: "settings",
        title: "الإعدادات",
        icon: Settings,
        subItems: [
          { id: "set-users", title: "المستخدمون", url: "/dashboard/users" },
          { id: "set-permissions", title: "الصلاحيات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "set-branches", title: "الفروع", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "set-departments", title: "الأقسام", url: "/dashboard/departments" },
          { id: "set-notifications", title: "الإشعارات", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "set-whatsapp", title: "إعدادات الذكاء الاصطناعي", url: "/dashboard/settings/whatsapp" },
          { id: "set-api", title: "API", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
          { id: "set-system", title: "النظام", url: "/dashboard/coming-soon", badge: "soon", disabled: true },
        ],
      },
    ],
  },
];
