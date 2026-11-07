
"use client";

import type { ForecastPoint } from "@/types/forecast";

export default function ForecastTable({
  forecasts,
}: {
  forecasts: ForecastPoint[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-400">
            <th className="px-4 py-3 font-medium">Forecast date</th>
            <th className="px-4 py-3 font-medium">Hotel</th>
            <th className="px-4 py-3 font-medium">Room category</th>
            <th className="px-4 py-3 text-right font-medium">
              Predicted demand
            </th>
          </tr>
        </thead>

        <tbody>
          {forecasts.map((item, index) => (
            <tr
              key={`${item.occupied_date}-${item.hotel}-${item.room_category}-${index}`}
              className="border-b border-slate-50 transition hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-slate-700">
                {new Date(
                  `${item.occupied_date}T00:00:00`
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              <td className="px-4 py-3 text-slate-600">
                {item.hotel}
              </td>

              <td className="px-4 py-3">
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {item.room_category}
                </span>
              </td>

              <td className="px-4 py-3 text-right font-semibold text-slate-800">
                {item.predicted_demand.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
