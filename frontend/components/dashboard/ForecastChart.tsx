
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import type { ForecastPoint } from "@/types/forecast";

interface Props {
  forecasts: ForecastPoint[];
}

export default function ForecastChart({ forecasts }: Props) {
  const dailyData = Object.values(
    forecasts.reduce<
      Record<string, { date: string; demand: number }>
    >((acc, item) => {
      if (!acc[item.occupied_date]) {
        acc[item.occupied_date] = {
          date: item.occupied_date,
          demand: 0,
        };
      }

      acc[item.occupied_date].demand += item.predicted_demand;

      return acc;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  const chartData = dailyData.map((item) => ({
    ...item,
    label: new Date(
      `${item.date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            stroke="#eef0f5"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e8ebf2",
              fontSize: 12,
            }}
            formatter={(value) => [
              Number(value).toFixed(2),
              "Reservation-night demand",
            ]}
          />

          <Line
            type="monotone"
            dataKey="demand"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#4f46e5",
              strokeWidth: 2,
              stroke: "#fff",
            }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
