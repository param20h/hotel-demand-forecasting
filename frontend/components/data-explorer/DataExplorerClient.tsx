
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Database,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react";

import { getDataExplorer } from "@/lib/api";
import type {
  DataExplorerResponse,
} from "@/types/data-explorer";

export default function DataExplorerClient() {
  const [data, setData] = useState<DataExplorerResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [hotel, setHotel] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 20;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDataExplorer({
        search,
        hotel,
        room_category: category,
        start_date: startDate,
        end_date: endDate,
        page,
        page_size: pageSize,
      });

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dataset."
      );
    } finally {
      setLoading(false);
    }
  }, [search, hotel, category, startDate, endDate, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  function resetFilters() {
    setSearch("");
    setHotel("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  function downloadCSV() {
    if (!data?.records.length) return;

    const headers = [
      "occupied_date",
      "hotel",
      "room_category",
      "occupied_room_nights",
    ];

    const rows = data.records.map((record) =>
      [
        record.occupied_date,
        record.hotel,
        record.room_category,
        record.occupied_room_nights,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `staycast-data-page-${page}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const pagination = data?.pagination;

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Workspace / Data Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Data Explorer
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Explore and inspect the processed daily room-demand dataset.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-5">
        <MetricCard
          title="Filtered Records"
          value={data?.summary.record_count.toLocaleString() ?? "—"}
          subtitle="Records matching current filters"
          icon={<Database size={19} />}
        />

        <MetricCard
          title="Total Reservation Nights"
          value={
            data?.summary.total_demand.toLocaleString() ?? "—"
          }
          subtitle="Sum of filtered daily demand"
          icon={<Filter size={19} />}
        />

        <MetricCard
          title="Average Daily Demand"
          value={
            data?.summary.average_demand.toFixed(2) ?? "—"
          }
          subtitle="Average across filtered records"
          icon={<Database size={19} />}
        />
      </div>

      {/* FILTERS */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />

          <h2 className="font-semibold text-gray-900">
            Dataset Filters
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Search
            </label>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3">
              <Search size={16} className="text-gray-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search date, hotel, category..."
                className="w-full py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Hotel
            </label>

            <select
              value={hotel}
              onChange={(e) => {
                setHotel(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All Hotels</option>

              {data?.filters.hotels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Room Category
            </label>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All Categories</option>

              {data?.filters.room_categories.map((item) => (
                <option key={item} value={item}>
                  Category {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* DATA TABLE */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-6">
          <div>
            <h2 className="font-semibold text-gray-900">
              Daily Demand Records
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {pagination?.total_records.toLocaleString() ?? 0} matching records
            </p>
          </div>

          <button
            onClick={downloadCSV}
            disabled={!data?.records.length}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export Current Page
          </button>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Hotel</th>
                <th className="px-6 py-4 font-medium">Room Category</th>
                <th className="px-6 py-4 text-right font-medium">
                  Daily Demand
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading dataset records...
                  </td>
                </tr>
              ) : data?.records.length ? (
                data.records.map((record, index) => (
                  <tr
                    key={`${record.occupied_date}-${record.hotel}-${record.room_category}-${index}`}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {record.occupied_date}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {record.hotel}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        Category {record.room_category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-gray-800">
                      {record.occupied_room_nights.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-500">
            Page {pagination?.page ?? 1} of {pagination?.total_pages ?? 1}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination?.total_pages ?? 1, current + 1)
                )
              }
              disabled={
                loading ||
                page >= (pagination?.total_pages ?? 1)
              }
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* DATA DEFINITION */}
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-900">
          About this dataset
        </h3>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          These are processed daily reservation-night demand records derived
          from completed stays in the historical Hotel Booking Demand dataset.
          They are not a live booking feed or a verified physical occupancy
          ledger. Demand values should not be interpreted as occupancy
          percentages.
        </p>
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
