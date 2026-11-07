
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { ForecastPoint } from "@/types/forecast";

export default function RoomCategoryChart({
  forecasts,
}: {
  forecasts: ForecastPoint[];
}) {
  const categories = Object.values(
    forecasts.reduce<
      Record<string, { category: string; demand: number }>
    >((acc, item) => {
      if (!acc[item.room_category]) {
        acc[item.room_category] = {
          category: item.room_category,
          demand: 0,
        };
      }

      acc[item.room_category].demand += item.predicted_demand;

      return acc;
    }, {})
  ).sort((a, b) => a.category.localeCompare(b.category));

  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={categories}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            stroke="#eef0f5"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />

          <Tooltip
            formatter={(value) => [
              Number(value).toFixed(2),
              "Predicted demand",
            ]}
          />

          <Bar
            dataKey="demand"
            fill="#0d9488"
            radius={[6, 6, 0, 0]}
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
