
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

export default function HotelComparison({
  forecasts,
}: {
  forecasts: ForecastPoint[];
}) {
  const hotels = Object.values(
    forecasts.reduce<
      Record<string, { hotel: string; demand: number }>
    >((acc, item) => {
      if (!acc[item.hotel]) {
        acc[item.hotel] = {
          hotel: item.hotel,
          demand: 0,
        };
      }

      acc[item.hotel].demand += item.predicted_demand;

      return acc;
    }, {})
  );

  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={hotels}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            stroke="#eef0f5"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="hotel"
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
            fill="#6366f1"
            radius={[7, 7, 0, 0]}
            maxBarSize={65}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
