
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TestModelMetric } from "@/types/evaluation";

interface Props {
  metrics: TestModelMetric[];
  horizon: "7-day" | "14-day";
}

export default function ModelComparison({
  metrics,
  horizon,
}: Props) {
  if (!metrics.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No model comparison data available for this horizon.
      </div>
    );
  }

  return (
    <section className="space-y-6">

      {/* CHARTS */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* MAE CHART */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">
            MAE Comparison
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Lower values indicate better average prediction accuracy.
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="Model"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[0, "auto"]}
                />

                <Tooltip
                  formatter={(value) => [
                    Number(value).toFixed(3),
                    "MAE",
                  ]}
                />

                <Bar
                  dataKey="MAE"
                  name="MAE"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* WAPE CHART */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold text-slate-900">
            WAPE Comparison
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Lower percentages indicate better weighted accuracy.
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="Model"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={[0, "auto"]}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(3)}%`,
                    "WAPE",
                  ]}
                />

                <Bar
                  dataKey="WAPE (%)"
                  name="WAPE"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* COMPARISON TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-900">
            Detailed Model Comparison
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {horizon} recursive forecast results on the held-out test set.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Model</th>
                <th className="px-5 py-3">MAE</th>
                <th className="px-5 py-3">RMSE</th>
                <th className="px-5 py-3">WAPE</th>
                <th className="px-5 py-3">Selection</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {metrics.map((item) => {
                const selected = item.Model === "Naive";

                return (
                  <tr
                    key={`${item.Horizon}-${item.Model}`}
                    className={selected ? "bg-blue-50/50" : ""}
                  >
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {item.Model}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.MAE.toFixed(3)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.RMSE.toFixed(3)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item["WAPE (%)"].toFixed(3)}%
                    </td>

                    <td className="px-5 py-4">
                      {selected ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Selected
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Candidate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </section>
  );
}
