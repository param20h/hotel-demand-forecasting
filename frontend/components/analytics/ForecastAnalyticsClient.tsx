
"use client";

import { useEffect, useMemo, useState } from "react";
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

import {
  CalendarDays,
  TrendingUp,
  Hotel,
  BedDouble,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { getForecast } from "@/lib/api";
import type { ForecastResponse } from "@/types/forecast";

export default function ForecastAnalyticsClient() {
  const [sevenDay, setSevenDay] =
    useState<ForecastResponse | null>(null);

  const [fourteenDay, setFourteenDay] =
    useState<ForecastResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const [seven, fourteen] = await Promise.all([
          getForecast(7),
          getForecast(14),
        ]);

        if (active) {
          setSevenDay(seven);
          setFourteenDay(fourteen);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load forecast analytics."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const sevenForecasts = sevenDay?.forecasts ?? [];
  const fourteenForecasts = fourteenDay?.forecasts ?? [];

  const total7 = sevenForecasts.reduce(
    (sum, item) => sum + item.predicted_demand,
    0
  );

  const total14 = fourteenForecasts.reduce(
    (sum, item) => sum + item.predicted_demand,
    0
  );

  const hotelData = useMemo(() => {
    const totals: Record<string, number> = {};

    fourteenForecasts.forEach((item) => {
      totals[item.hotel] =
        (totals[item.hotel] ?? 0) + item.predicted_demand;
    });

    return Object.entries(totals).map(([hotel, demand]) => ({
      hotel,
      demand: Number(demand.toFixed(2)),
    }));
  }, [fourteenForecasts]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};

    fourteenForecasts.forEach((item) => {
      totals[item.room_category] =
        (totals[item.room_category] ?? 0) + item.predicted_demand;
    });

    return Object.entries(totals)
      .map(([category, demand]) => ({
        category,
        demand: Number(demand.toFixed(2)),
      }))
      .sort((a, b) => b.demand - a.demand);
  }, [fourteenForecasts]);

  const dailyData = useMemo(() => {
    const totals: Record<string, number> = {};

    fourteenForecasts.forEach((item) => {
      totals[item.occupied_date] =
        (totals[item.occupied_date] ?? 0) + item.predicted_demand;
    });

    return Object.entries(totals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, demand]) => ({
        date,
        demand: Number(demand.toFixed(2)),
      }));
  }, [fourteenForecasts]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-indigo-600" size={32} />
          <p className="mt-3 text-sm text-slate-500">
            Loading forecast analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <AlertCircle size={19} />
          Unable to load analytics
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* HEADER */}

      <section>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
          <TrendingUp size={16} />
          Forecast Intelligence
        </div>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Forecast Analytics
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Compare forecast horizons and explore predicted demand
          across hotels and room categories.
        </p>
      </section>


      {/* SUMMARY CARDS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="7-Day Demand"
          value={total7.toFixed(0)}
          description="Predicted reservation nights"
          icon={<CalendarDays size={19} />}
        />

        <SummaryCard
          title="14-Day Demand"
          value={total14.toFixed(0)}
          description="Predicted reservation nights"
          icon={<TrendingUp size={19} />}
        />

        <SummaryCard
          title="Hotels Tracked"
          value={String(new Set(fourteenForecasts.map(x => x.hotel)).size)}
          description="Across the forecast window"
          icon={<Hotel size={19} />}
        />

        <SummaryCard
          title="Room Categories"
          value={String(new Set(fourteenForecasts.map(x => x.room_category)).size)}
          description="Distinct room categories"
          icon={<BedDouble size={19} />}
        />

      </section>


      {/* HORIZON COMPARISON */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="font-semibold text-slate-900">
          Forecast Horizon Comparison
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Total predicted reservation-night demand for each forecast window.
        </p>

        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { horizon: "7 Days", demand: Number(total7.toFixed(2)) },
                { horizon: "14 Days", demand: Number(total14.toFixed(2)) },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="horizon" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="demand"
                name="Predicted demand"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>


      {/* DAILY DEMAND */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">

        <h2 className="font-semibold text-slate-900">
          Daily Demand Trend
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Aggregated predicted demand across the 14-day horizon.
        </p>

        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="demand"
                name="Predicted demand"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>


      {/* HOTEL AND CATEGORY COMPARISON */}

      <section className="grid gap-6 xl:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Demand by Hotel
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Fourteen-day predicted demand by hotel.
          </p>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hotelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hotel" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="demand"
                  name="Predicted demand"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Demand by Room Category
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Fourteen-day predicted demand by room category.
          </p>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="demand"
                  name="Predicted demand"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>


      {/* MODEL INFORMATION */}

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <h3 className="font-semibold text-slate-900">
          Forecast Methodology
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {fourteenDay?.methodology}
        </p>

        <p className="mt-2 text-xs text-slate-600">
          <strong>Model:</strong> {fourteenDay?.model}
        </p>

        <p className="mt-2 text-xs leading-5 text-amber-700">
          <strong>Data limitation:</strong> {fourteenDay?.data_limitation}
        </p>
      </section>

    </div>
  );
}


function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}
