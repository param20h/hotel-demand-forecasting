
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  BedDouble,
  CalendarDays,
  TrendingUp,
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
import type { ForecastResponse, ForecastPoint } from "@/types/forecast";

type HotelFilter = "all" | string;

export default function HotelsClient() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [horizon, setHorizon] = useState<7 | 14>(14);
  const [selectedHotel, setSelectedHotel] = useState<HotelFilter>("all");

  useEffect(() => {
    let active = true;

    async function loadForecast() {
      try {
        setLoading(true);
        setError("");

        const response = await getForecast(horizon);

        if (active) {
          setData(response);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load hotel forecasts."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadForecast();

    return () => {
      active = false;
    };
  }, [horizon]);

  const forecasts = data?.forecasts ?? [];

  const hotels = useMemo(
    () => [...new Set(forecasts.map((item) => item.hotel))].sort(),
    [forecasts]
  );

  const filteredForecasts = useMemo(
    () =>
      selectedHotel === "all"
        ? forecasts
        : forecasts.filter((item) => item.hotel === selectedHotel),
    [forecasts, selectedHotel]
  );

  const totalDemand = filteredForecasts.reduce(
    (sum, item) => sum + item.predicted_demand,
    0
  );

  const categories = new Set(
    filteredForecasts.map((item) => item.room_category)
  ).size;

  const dailyData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredForecasts.forEach((item) => {
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
  }, [filteredForecasts]);

  const hotelComparison = useMemo(() => {
    const grouped = new Map<string, number>();

    forecasts.forEach((item) => {
      grouped.set(
        item.hotel,
        (grouped.get(item.hotel) ?? 0) + item.predicted_demand
      );
    });

    return [...grouped.entries()].map(([hotel, demand]) => ({
      hotel,
      demand: Number(demand.toFixed(2)),
    }));
  }, [forecasts]);

  const categoryData = useMemo(() => {
    const grouped = new Map<string, number>();

    filteredForecasts.forEach((item) => {
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
  }, [filteredForecasts]);

  const hotelCategoryData = useMemo(() => {
    const grouped = new Map<string, Record<string, number>>();

    forecasts.forEach((item) => {
      if (!grouped.has(item.hotel)) {
        grouped.set(item.hotel, {});
      }

      const row = grouped.get(item.hotel)!;
      row[item.room_category] =
        (row[item.room_category] ?? 0) + item.predicted_demand;
    });

    return [...grouped.entries()].map(([hotel, values]) => ({
      hotel,
      ...values,
    }));
  }, [forecasts]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading hotel analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">Could not load hotel analytics</p>
        <p className="mt-2">{error}</p>
        <p className="mt-2 text-xs">
          Make sure your FastAPI backend is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Workspace / Hotel Analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Hotels
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Compare predicted reservation-night demand across hotel properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none"
          >
            <option value="all">All Hotels</option>
            {hotels.map((hotel) => (
              <option key={hotel} value={hotel}>
                {hotel}
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

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-5">
        <MetricCard
          title="Predicted Room Nights"
          value={Math.round(totalDemand).toLocaleString()}
          subtitle={`Next ${horizon} days`}
          icon={<BedDouble size={19} />}
        />
        <MetricCard
          title="Hotels Tracked"
          value={
            selectedHotel === "all" ? hotels.length : 1
          }
          subtitle="Properties in forecast"
          icon={<Building2 size={19} />}
        />
        <MetricCard
          title="Room Categories"
          value={categories}
          subtitle="Categories with forecast data"
          icon={<TrendingUp size={19} />}
        />
      </div>

      {/* Daily demand chart */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Daily Hotel Demand
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Predicted room-night demand by date
            </p>
          </div>
          <CalendarDays size={20} className="text-gray-400" />
        </div>

        <div className="h-[310px]">
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
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Hotel and category charts */}
      <div className="grid grid-cols-2 gap-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">
            Hotel Comparison
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Total predicted demand by property
          </p>

          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotelComparison}>
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

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">
            Room Category Demand
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Demand distribution for the selected hotel
          </p>

          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="demand"
                  name="Predicted room nights"
                  fill="#0d9488"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Category breakdown table */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">
          Hotel-wise Room Category Breakdown
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Predicted demand by hotel and reserved room category
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="pb-3 font-medium">Hotel</th>
                {categoryData.map((item) => (
                  <th
                    key={item.category}
                    className="px-3 pb-3 text-right font-medium"
                  >
                    {item.category}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {hotelCategoryData.map((row) => (
                <tr
                  key={row.hotel}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-4 font-medium text-gray-800">
                    {row.hotel}
                  </td>

                  {categoryData.map((item) => (
                    <td
                      key={item.category}
                      className="px-3 py-4 text-right text-gray-600"
                    >
                      {Math.round(
                        (row as Record<string, unknown>)[item.category] as number ?? 0
                      ).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Methodology note */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">
          Understanding these forecasts
        </h3>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          These values represent predicted reservation-night demand, not
          verified physical occupancy or occupancy percentages. The historical
          dataset does not provide verified hotel room capacity. The current
          production forecasting strategy uses recursive persistence.
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
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
