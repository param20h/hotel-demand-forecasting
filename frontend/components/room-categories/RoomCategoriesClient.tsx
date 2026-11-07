
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Building2,
  TrendingUp,
  Layers3,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getForecast } from "@/lib/api";
import type { ForecastResponse } from "@/types/forecast";

export default function RoomCategoriesClient() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [horizon, setHorizon] = useState<7 | 14>(14);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await getForecast(horizon);

        if (active) setData(response);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load room category analytics."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [horizon]);

  const forecasts = data?.forecasts ?? [];

  const categories = useMemo(
    () =>
      [...new Set(forecasts.map((item) => item.room_category))].sort(),
    [forecasts]
  );

  const hotels = useMemo(
    () => [...new Set(forecasts.map((item) => item.hotel))].sort(),
    [forecasts]
  );

  const categoryTotals = useMemo(() => {
    const grouped = new Map<string, number>();

    forecasts.forEach((item) => {
      grouped.set(
        item.room_category,
        (grouped.get(item.room_category) ?? 0) + item.predicted_demand
      );
    });

    return [...grouped.entries()]
      .map(([category, demand]) => ({
        category,
        demand: Number(demand.toFixed(2)),
      }))
      .sort((a, b) => b.demand - a.demand);
  }, [forecasts]);

  const selectedForecasts = useMemo(
    () =>
      selectedCategory === "all"
        ? forecasts
        : forecasts.filter(
            (item) => item.room_category === selectedCategory
          ),
    [forecasts, selectedCategory]
  );

  const totalDemand = selectedForecasts.reduce(
    (sum, item) => sum + item.predicted_demand,
    0
  );

  const topCategory = categoryTotals[0];

  const dailyData = useMemo(() => {
    const grouped = new Map<string, number>();

    selectedForecasts.forEach((item) => {
      grouped.set(
        item.occupied_date,
        (grouped.get(item.occupied_date) ?? 0) + item.predicted_demand
      );
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, demand]) => ({
        date: date.slice(5),
        demand: Number(demand.toFixed(2)),
      }));
  }, [selectedForecasts]);

  const hotelBreakdown = useMemo(() => {
    const grouped = new Map<string, number>();

    selectedForecasts.forEach((item) => {
      grouped.set(
        item.hotel,
        (grouped.get(item.hotel) ?? 0) + item.predicted_demand
      );
    });

    return [...grouped.entries()].map(([hotel, demand]) => ({
      hotel,
      demand: Number(demand.toFixed(2)),
    }));
  }, [selectedForecasts]);

  const categoryHotelData = useMemo(() => {
    return categoryTotals.map((category) => {
      const row: Record<string, string | number> = {
        category: category.category,
      };

      hotels.forEach((hotel) => {
        row[hotel] = forecasts
          .filter(
            (item) =>
              item.room_category === category.category &&
              item.hotel === hotel
          )
          .reduce((sum, item) => sum + item.predicted_demand, 0);
      });

      return row;
    });
  }, [categoryTotals, forecasts, hotels]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading room category analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">
          Could not load room category analytics
        </p>
        <p className="mt-2">{error}</p>
        <p className="mt-2 text-xs">
          Make sure your FastAPI backend is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Workspace / Demand Analytics
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Room Categories
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Analyse predicted reservation-night demand by room category.
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                Category {category}
              </option>
            ))}
          </select>

          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value) as 7 | 14)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none"
          >
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-5">
        <MetricCard
          title="Predicted Room Nights"
          value={Math.round(totalDemand).toLocaleString()}
          subtitle={`Next ${horizon} days`}
          icon={<BedDouble size={19} />}
        />

        <MetricCard
          title="Categories Tracked"
          value={categories.length}
          subtitle="Available room categories"
          icon={<Layers3 size={19} />}
        />

        <MetricCard
          title="Highest Demand Category"
          value={
            selectedCategory === "all"
              ? topCategory?.category ?? "—"
              : selectedCategory
          }
          subtitle={
            selectedCategory === "all"
              ? `Category ${topCategory?.category ?? "—"}`
              : "Selected category"
          }
          icon={<TrendingUp size={19} />}
        />
      </div>

      {/* CATEGORY DEMAND RANKING */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">
          Room Category Demand Ranking
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Total predicted demand across the selected forecast horizon
        </p>

        <div className="mt-5 h-[330px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryTotals}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="demand"
                name="Predicted room nights"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* DAILY TREND AND HOTEL BREAKDOWN */}
      <div className="grid grid-cols-2 gap-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">
            Daily Category Demand
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Demand trend for the selected category
          </p>

          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="demand"
                  name="Predicted demand"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">
            Hotel-wise Category Demand
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Compare demand across hotel properties
          </p>

          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotelBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hotel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="demand"
                  name="Predicted room nights"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* CATEGORY BY HOTEL TABLE */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Building2 size={19} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900">
            Category-wise Hotel Breakdown
          </h2>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Compare predicted room-night demand for each category by hotel
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="pb-3 font-medium">Room Category</th>
                {hotels.map((hotel) => (
                  <th
                    key={hotel}
                    className="px-4 pb-3 text-right font-medium"
                  >
                    {hotel}
                  </th>
                ))}
                <th className="px-4 pb-3 text-right font-medium">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {categoryHotelData.map((row) => {
                const total = hotels.reduce(
                  (sum, hotel) => sum + Number(row[hotel] ?? 0),
                  0
                );

                return (
                  <tr
                    key={String(row.category)}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="py-4 font-medium text-gray-800">
                      Category {row.category}
                    </td>

                    {hotels.map((hotel) => (
                      <td
                        key={hotel}
                        className="px-4 py-4 text-right text-gray-600"
                      >
                        {Math.round(Number(row[hotel] ?? 0)).toLocaleString()}
                      </td>
                    ))}

                    <td className="px-4 py-4 text-right font-semibold text-gray-900">
                      {Math.round(total).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">
          Forecast methodology
        </h3>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Category-level demand is calculated using the reserved room
          category from historical booking records. Predictions represent
          reservation-night demand, not physical room occupancy or
          occupancy percentages.
        </p>

        {data?.data_limitation && (
          <p className="mt-2 text-sm leading-6 text-amber-800">
            {data.data_limitation}
          </p>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        <span className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}
