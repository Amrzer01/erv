"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ProbabilityDistribution } from "./types";

const COLORS = {
  "0-25%": "#ef4444",
  "26-50%": "#f97316",
  "51-75%": "#3b82f6",
  "76-100%": "#22c55e",
};

interface ProbabilityDistributionChartProps {
  data: ProbabilityDistribution[];
}

export function ProbabilityDistributionChart({ data }: ProbabilityDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.range,
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">توزيع احتمال الحجز</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => {
              const total = chartData.reduce((sum, item) => sum + item.value, 0);
              const percentage = ((value / total) * 100).toFixed(0);
              return `${name} (${percentage}%)`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"} />
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
