"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TopLead } from "./types";
import { getProbabilityColor } from "./utils";

interface BookingProbabilityChartProps {
  data: TopLead[];
}

export function BookingProbabilityChart({ data }: BookingProbabilityChartProps) {
  const chartData = data.map((lead) => ({
    name: lead.customer_name,
    probability: lead.booking_probability,
    category: lead.booking_category || "غير محدد",
  }));

  const getBarColor = (probability: number) => {
    if (probability >= 90) return "#22c55e";
    if (probability >= 70) return "#3b82f6";
    if (probability >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">أعلى 10 عملاء من حيث احتمال الحجز</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" domain={[0, 100]} stroke="var(--muted-foreground)" />
          <YAxis dataKey="name" type="category" width={120} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            formatter={(value: any) => [`${value || 0}%`, "احتمال الحجز"]}
          />
          <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <rect key={`bar-${index}`} fill={getBarColor(entry.probability)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
