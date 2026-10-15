"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryDistribution } from "./types";

const CATEGORY_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#06b6d4", "#eab308", "#ef4444"];

interface BookingCategoryChartProps {
  data: CategoryDistribution[];
}

export function BookingCategoryChart({ data }: BookingCategoryChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.count,
    percentage: item.percentage,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">توزيع فئات الحجز</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name }) => name}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            formatter={(value: any) => [`${value || 0} عميل`, "العدد"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
