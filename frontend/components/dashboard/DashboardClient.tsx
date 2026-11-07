
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  ChartLine,
  Hotel,
  BedDouble,
  RefreshCw,
  AlertCircle,
} from "lucide-react";


import MetricCard from "./MetricCard";
import ForecastChart from "./ForecastChart";
import HotelComparison from "./HotelComparison";
import RoomCategoryChart from "./RoomCategoryChart";
import ForecastTable from "./ForecastTable";

import { getForecast } from "@/lib/api";
import type { ForecastResponse } from "@/types/forecast";

type Horizon = 7 | 14;

export default function DashboardClient() {
  // Dashboard state
  const [horizon, setHorizon] = useState<Horizon>(7);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Load forecast data
  const loadForecast = useCallback(async (selectedHorizon: Horizon) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getForecast(selectedHorizon);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load forecast data."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data whenever forecast horizon changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadForecast(horizon);
  }, [horizon, loadForecast]);

  // All forecast records
  const allForecasts = data?.forecasts ?? [];

  // Available hotels
  const availableHotels = Array.from(
    new Set(allForecasts.map((item) => item.hotel))
  ).sort();

  // Available room categories
  const availableCategories = Array.from(
    new Set(allForecasts.map((item) => item.room_category))
  ).sort();

  // Apply hotel and category filters
  const forecasts = allForecasts.filter((item) => {
    const matchesHotel =
      selectedHotel === "all" ||
      item.hotel === selectedHotel;

    const matchesCategory =
      selectedCategory === "all" ||
      item.room_category === selectedCategory;

    return matchesHotel && matchesCategory;
  });

  // Calculate filtered demand
  const totalDemand = forecasts.reduce(
    (total, item) => total + item.predicted_demand,
    0
  );

  // Calculate filtered hotel count
  const hotels = new Set(
    forecasts.map((item) => item.hotel)
  );

  // Calculate filtered category count
  const categories = new Set(
    forecasts.map((item) => item.room_category)
  );

  // Reset filters
  const resetFilters = () => {
    setSelectedHotel("all");
    setSelectedCategory("all");
  };

  return (
    <>
      {/* Introduction */}
      <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Forecast Intelligence
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Demand Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Monitor predicted hotel reservation-night demand
            across hotels and room categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
            <CalendarDays size={15} />
            {data?.forecast_origin ?? "Loading historical data"}
          </div>

          <button
            onClick={() => loadForecast(horizon)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* Forecast Horizon Selector */}
      <section className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Forecast horizon
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Select your prediction window
          </p>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1">
          {([7, 14] as const).map((days) => (
            <button
              key={days}
              onClick={() => setHorizon(days)}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                horizon === days
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </section>

      {/* Hotel and Category Filters */}
      <section className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Filter forecast data
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Explore predictions by hotel and room category
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Hotel Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">
              Hotel
            </label>

            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="min-w-[155px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All Hotels</option>

              {availableHotels.map((hotel) => (
                <option key={hotel} value={hotel}>
                  {hotel}
                </option>
              ))}
            </select>
          </div>

          {/* Room Category Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500">
              Room Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="min-w-[155px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>

              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  Category {category}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
          Loading real forecast predictions from the FastAPI backend...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={19} className="mt-0.5 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load forecast
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>

            <p className="mt-2 text-xs text-red-600">
              Check that your FastAPI server is running on port 8000.
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Predicted Demand"
          value={
            loading ? "..." : totalDemand.toFixed(0)
          }
          description={`Reservation nights across ${horizon} forecast days`}
          icon={ChartLine}
          iconColor="bg-indigo-50 text-indigo-600"
        />

        <MetricCard
          title="Hotels Tracked"
          value={loading ? "..." : String(hotels.size)}
          description="Hotel groups in this forecast"
          icon={Hotel}
          iconColor="bg-blue-50 text-blue-600"
        />

        <MetricCard
          title="Room Categories"
          value={loading ? "..." : String(categories.size)}
          description="Distinct room categories"
          icon={BedDouble}
          iconColor="bg-violet-50 text-violet-600"
        />

        <MetricCard
          title="Forecast Horizon"
          value={`${horizon} Days`}
          description={data?.model ?? "Forecast model"}
          icon={CalendarDays}
          iconColor="bg-emerald-50 text-emerald-600"
        />
      </section>

      {/* Main Chart */}
      <section className="mt-7 rounded-2xl border border-[#e8ebf2] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Daily Demand Forecast
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Aggregated predicted reservation-night demand by date
          </p>
        </div>

        {forecasts.length > 0 && !loading ? (
          <ForecastChart forecasts={forecasts} />
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-slate-400">
            {loading ? "Loading chart..." : "No forecast data available"}
          </div>
        )}
      </section>

      {/* Comparison Charts */}
      <section className="mt-7 grid gap-6 xl:grid-cols-2">
        {/* Hotel Comparison */}
        <div className="rounded-2xl border border-[#e8ebf2] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            Hotel Comparison
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Total predicted demand by hotel
          </p>

          <div className="mt-5">
            {forecasts.length > 0 && !loading ? (
              <HotelComparison forecasts={forecasts} />
            ) : (
              <div className="flex h-[230px] items-center justify-center text-xs text-slate-400">
                {loading ? "Loading..." : "No data available"}
              </div>
            )}
          </div>
        </div>

        {/* Room Category Comparison */}
        <div className="rounded-2xl border border-[#e8ebf2] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            Room Category Demand
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Total predicted demand by room category
          </p>

          <div className="mt-5">
            {forecasts.length > 0 && !loading ? (
              <RoomCategoryChart forecasts={forecasts} />
            ) : (
              <div className="flex h-[230px] items-center justify-center text-xs text-slate-400">
                {loading ? "Loading..." : "No data available"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Forecast Records */}
      <section className="mt-7 rounded-2xl border border-[#e8ebf2] bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Forecast Records
          </h2>

          <p className="mt-1 text-xs text-slate-400">
          Showing {forecasts.length} records from the selected filters
          </p>
        </div>

        {forecasts.length > 0 && !loading ? (
          <ForecastTable forecasts={forecasts} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">
            {loading ? "Loading forecast records..." : "No records available"}
          </p>
        )}
      </section>

      {/* Model Explanation */}
      {data && (
        <section className="mt-7 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <ChartLine size={19} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                {data.model}
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                {data.methodology}
              </p>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                <strong>Target:</strong> {data.target_definition}
              </p>

              <p className="mt-2 text-xs leading-6 text-amber-700">
                <strong>Limitation:</strong> {data.data_limitation}
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
