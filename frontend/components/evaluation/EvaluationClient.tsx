
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Building2,
  Loader2,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getEvaluation } from "@/lib/api";

import type {
  EvaluationResponse,
  TestModelMetric,
} from "@/types/evaluation";

import ModelSelectionInsight from "./ModelSelectionInsight";
import EvaluationMetrics from "./EvaluationMetrics";
import ModelComparison from "./ModelComparison";
import CategoryErrorAnalysis from "./CategoryErrorAnalysis";


type Horizon = "7-day" | "14-day";


export default function EvaluationClient() {
  const [data, setData] = useState<EvaluationResponse | null>(null);

  const [horizon, setHorizon] = useState<Horizon>("7-day");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);


  // --------------------------------------------------
  // FETCH EVALUATION DATA
  // --------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadEvaluation() {
      try {
        setLoading(true);
        setError(null);

        const result = await getEvaluation();

        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load evaluation data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvaluation();

    return () => {
      active = false;
    };
  }, []);


  // --------------------------------------------------
  // FILTER TEST METRICS BY HORIZON
  // --------------------------------------------------

  const testMetrics = useMemo(() => {
    return (
      data?.test_comparison.filter(
        (item) => item.Horizon === horizon
      ) ?? []
    );
  }, [data, horizon]);


  // --------------------------------------------------
  // SELECTED MODEL METRICS
  // --------------------------------------------------

  const selectedMetrics = useMemo(() => {
    return testMetrics.find(
      (item) => item.Model === "Naive"
    );
  }, [testMetrics]);


  // --------------------------------------------------
  // HOTEL ERROR ANALYSIS
  // --------------------------------------------------

  const hotelData = useMemo(() => {
    return (
      data?.error_analysis.by_hotel.filter(
        (item) => item.model.toLowerCase() === "naive"
      ) ?? []
    );
  }, [data]);


  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-blue-600"
            size={34}
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading model evaluation...
          </p>
        </div>
      </div>
    );
  }


  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error || !data) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <AlertCircle size={20} />

          Evaluation data could not be loaded
        </div>

        <p className="mt-2 text-sm text-red-600">
          {error ?? "No evaluation data was returned."}
        </p>

        <p className="mt-2 text-sm text-red-600">
          Check that your FastAPI backend is running on port 8000.
        </p>
      </div>
    );
  }


  // --------------------------------------------------
  // MAIN DASHBOARD
  // --------------------------------------------------

  return (
    <div className="space-y-8">

        {/* PAGE HEADER */}

        <section>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <BarChart3 size={17} />

                Model Performance
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Model Evaluation
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Model comparison, historical performance and error analysis.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs text-slate-500">
                Evaluation Type
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {data.evaluation_type}
              </p>
            </div>

          </div>
        </section>


        {/* SELECTED MODEL */}

        <ModelSelectionInsight
          name={data.selected_model.name}
          reason={data.selected_model.reason}
        />


        {/* HORIZON SELECTOR */}

        <section className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Held-out Test Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Compare models using unseen historical data.
            </p>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-white p-1">

            {(["7-day", "14-day"] as Horizon[]).map((value) => (
              <button
                key={value}
                onClick={() => setHorizon(value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  horizon === value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {value}
              </button>
            ))}

          </div>
        </section>


        {/* METRIC CARDS */}

        {selectedMetrics ? (
          <EvaluationMetrics
            mae={selectedMetrics.MAE}
            rmse={selectedMetrics.RMSE}
            wape={selectedMetrics["WAPE (%)"]}
          />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Naive model metrics are unavailable for this horizon.
          </div>
        )}


        {/* MODEL COMPARISON */}

        <ModelComparison
          metrics={testMetrics}
          horizon={horizon}
        />


        {/* RECURSIVE VALIDATION */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5">

          <div>
            <h3 className="font-bold text-slate-900">
              Recursive Validation Results
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Validation performance for separate forecast horizons.
            </p>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">

            {(
              [
                ["7_day", "7-day"],
                ["14_day", "14-day"],
              ] as const
            ).map(([key, label]) => {

              const rows = data.recursive_validation[key];

              return (
                <div key={key}>

                  <h4 className="mb-3 font-semibold text-slate-800">
                    {label} validation
                  </h4>

                  <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th className="p-3 text-left">Model</th>
                          <th className="p-3 text-right">MAE</th>
                          <th className="p-3 text-right">RMSE</th>
                          <th className="p-3 text-right">WAPE</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {rows.map((item) => (
                          <tr key={item.Model}>

                            <td className="p-3 font-medium text-slate-800">
                              {item.Model}
                            </td>

                            <td className="p-3 text-right text-slate-600">
                              {item.MAE.toFixed(3)}
                            </td>

                            <td className="p-3 text-right text-slate-600">
                              {item.RMSE.toFixed(3)}
                            </td>

                            <td className="p-3 text-right text-slate-600">
                              {item["WAPE (%)"].toFixed(3)}%
                            </td>

                          </tr>
                        ))}

                      </tbody>
                    </table>

                  </div>

                </div>
              );
            })}

          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Validation and held-out test results are distinct experiments.
            Their metrics should not be interpreted as results from the
            same evaluation window.
          </p>

        </section>


        {/* CATEGORY ERROR ANALYSIS */}

        <CategoryErrorAnalysis
          data={data.error_analysis.by_room_category.filter(
            (item) => item.Model === "Naive"
          )}
        />


        {/* HOTEL ERROR ANALYSIS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
              <Building2 size={20} />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Error Analysis by Hotel
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Naive model performance on the 7-day test evaluation.
              </p>
            </div>

          </div>


          <div className="mt-6 h-72">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart
                data={hotelData}
                margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="hotel" />

                <YAxis />

                <Tooltip
                  formatter={(value) => [
                    Number(value).toFixed(3),
                    "MAE",
                  ]}
                />

                <Bar
                  dataKey="MAE"
                  name="MAE"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>


          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {hotelData.map((item) => (
              <div
                key={item.hotel}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >

                <p className="font-semibold text-slate-800">
                  {item.hotel}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-3">

                  <div>
                    <p className="text-xs text-slate-500">
                      MAE
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {item.MAE.toFixed(3)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Average Error
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {item.Average_Error > 0 ? "+" : ""}
                      {item.Average_Error.toFixed(3)}
                    </p>
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {item.Observations.toLocaleString()} observations
                </p>

              </div>
            ))}

          </div>

        </section>


        {/* EVALUATION LIMITATIONS */}

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertCircle size={19} />

            Evaluation Limitations
          </div>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900">

            {data.limitations.map((limitation, index) => (
              <li key={index}>
                {limitation}
              </li>
            ))}

          </ul>

        </section>


        {/* FOOTER */}

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          StayCast · Historical ML Model Evaluation
        </footer>

      </div>

    
  );
}
