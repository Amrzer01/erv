"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { CustomerFollowUp, CustomerServiceRequest, PotentialClient } from "./types";

interface AnalyticsChartsProps {
  followUps: CustomerFollowUp[];
  serviceRequests: CustomerServiceRequest[];
  potentialClients: PotentialClient[];
  loading: boolean;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function AnalyticsCharts({ followUps, serviceRequests, potentialClients, loading }: AnalyticsChartsProps) {
  // Follow Ups per Day - Stacked Area
  const followUpsByDay = followUps.reduce(
    (acc, followUp) => {
      const date = new Date(followUp.scheduled_for).toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
      if (!acc[date]) {
        acc[date] = { date, pending: 0, in_progress: 0, sent: 0, failed: 0, completed: 0 };
      }
      acc[date][followUp.status]++;
      return acc;
    },
    {} as Record<
      string,
      { date: string; pending: number; in_progress: number; sent: number; failed: number; completed: number }
    >,
  );

  const followUpsData = Object.values(followUpsByDay).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Support Requests by Type - Bar Chart
  const requestsByType = serviceRequests.reduce(
    (acc, request) => {
      if (!acc[request.request_type]) {
        acc[request.request_type] = 0;
      }
      acc[request.request_type]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  const requestsData = Object.entries(requestsByType).map(([type, count]) => ({ type, count }));

  // Potential Client Probability Distribution - Histogram
  const probabilityRanges = [
    { range: "0-20%", min: 0, max: 20 },
    { range: "21-40%", min: 21, max: 40 },
    { range: "41-60%", min: 41, max: 60 },
    { range: "61-80%", min: 61, max: 80 },
    { range: "81-100%", min: 81, max: 100 },
  ];

  const probabilityData = probabilityRanges.map(({ range, min, max }) => ({
    range,
    count: potentialClients.filter((c) => c.booking_probability >= min && c.booking_probability <= max).length,
  }));

  // Success Rate Gauge
  const sentCount = followUps.filter((f) => f.status === "sent").length;
  const failedCount = followUps.filter((f) => f.status === "failed").length;
  const successRate = sentCount + failedCount > 0 ? (sentCount / (sentCount + failedCount)) * 100 : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">التحليلات</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow Ups per Day - Stacked Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المتابعات يومياً</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={followUpsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  name="قيد الانتظار"
                />
                <Area type="monotone" dataKey="sent" stackId="1" stroke="#10b981" fill="#10b981" name="تم الإرسال" />
                <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" name="فشل" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Support Requests - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">طلبات خدمة العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={requestsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Potential Client Probability Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">توزيع احتمالية الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={probabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">معدل النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[300px]">
              <div className="relative size-48">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${successRate * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{successRate.toFixed(1)}%</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {sentCount} تم الإرسال • {failedCount} فشل
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
