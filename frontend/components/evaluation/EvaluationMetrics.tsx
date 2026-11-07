
import { Target, TrendingDown, BarChart3 } from "lucide-react";

interface Props {
  mae: number;
  rmse: number;
  wape: number;
}

export default function EvaluationMetrics({
  mae,
  rmse,
  wape,
}: Props) {
  const metrics = [
    {
      title: "Mean Absolute Error",
      value: mae.toFixed(3),
      description: "Average absolute prediction error",
      icon: Target,
    },
    {
      title: "Root Mean Squared Error",
      value: rmse.toFixed(3),
      description: "Penalizes larger prediction errors",
      icon: TrendingDown,
    },
    {
      title: "Weighted Absolute Percentage Error",
      value: `${wape.toFixed(2)}%`,
      description: "Error relative to total actual demand",
      icon: BarChart3,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {metric.title}
              </p>

              <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                <Icon size={19} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {metric.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {metric.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}
