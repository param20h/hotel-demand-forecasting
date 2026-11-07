
import { CheckCircle2, Info } from "lucide-react";

interface Props {
  name: string;
  reason: string;
}

export default function ModelSelectionInsight({
  name,
  reason,
}: Props) {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
        <CheckCircle2 size={18} />
        Selected Production Strategy
      </div>

      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        {name}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
        {reason}
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-white p-3">
        <Info size={17} className="mt-0.5 shrink-0 text-blue-600" />

        <p className="text-xs leading-5 text-slate-600">
          The model was selected based on held-out test performance,
          not training accuracy. A simpler baseline can be the better
          production choice when it generalizes more effectively.
        </p>
      </div>
    </section>
  );
}
