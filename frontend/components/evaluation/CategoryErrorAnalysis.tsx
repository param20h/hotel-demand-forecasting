
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CategoryError } from "@/types/evaluation";

interface Props {
  data: CategoryError[];
}

export default function CategoryErrorAnalysis({ data }: Props) {
  const categoryData = [...data].sort(
    (a, b) => b.MAE - a.MAE
  );

  if (!categoryData.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-slate-900">
          Error Analysis by Room Category
        </h3>
        <p className="mt-3 text-sm text-slate-500">
          No room-category evaluation data is available.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* HEADER */}

      <div>
        <h3 className="font-bold text-slate-900">
          Error Analysis by Room Category
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Naive model performance across room categories on the
          7-day held-out test evaluation.
        </p>
      </div>

      {/* MAE CHART */}

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryData}
            margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="Room Category"
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
              name="Mean Absolute Error"
              fill="#3b82f6"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY TABLE */}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Category</th>
              <th className="p-3">MAE</th>
              <th className="p-3">WAPE</th>
              <th className="p-3">Bias</th>
              <th className="p-3">Actual Demand</th>
              <th className="p-3">Observations</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {categoryData.map((item) => (
              <tr key={item["Room Category"]}>
                <td className="p-3 font-semibold text-slate-800">
                  {item["Room Category"]}
                </td>

                <td className="p-3 text-slate-600">
                  {item.MAE.toFixed(3)}
                </td>

                <td className="p-3 text-slate-600">
                  {item["WAPE (%)"].toFixed(2)}%
                </td>

                <td className="p-3 text-slate-600">
                  <span
                    className={
                      item.Bias > 0
                        ? "font-medium text-amber-700"
                        : item.Bias < 0
                          ? "font-medium text-blue-700"
                          : "text-slate-600"
                    }
                  >
                    {item.Bias > 0 ? "+" : ""}
                    {item.Bias.toFixed(3)}
                  </span>
                </td>

                <td className="p-3 text-slate-600">
                  {item["Actual Demand"].toLocaleString()}
                </td>

                <td className="p-3 text-slate-600">
                  {item.Observations.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INTERPRETATION */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-slate-800">
          How to interpret these results
        </h4>

        <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
          <li>
            <strong>MAE:</strong> Average absolute prediction error.
            Lower is better.
          </li>

          <li>
            <strong>WAPE:</strong> Error relative to total actual demand.
            Low-volume categories can have disproportionately high WAPE.
          </li>

          <li>
            <strong>Bias:</strong> Positive values indicate overprediction;
            negative values indicate underprediction, assuming the report
            defines bias as prediction minus actual.
          </li>

          <li>
            <strong>Observations:</strong> Number of evaluated records
            contributing to each category&apos;s metrics.
          </li>
        </ul>
      </div>
    </section>
  );
}
