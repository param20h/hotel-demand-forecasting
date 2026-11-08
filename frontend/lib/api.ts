
import type { ForecastResponse } from "@/types/forecast";
import type { EvaluationResponse } from "@/types/evaluation";
import type {
  DataExplorerParams,
  DataExplorerResponse,
} from "@/types/data-explorer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function getForecast(
  horizon: 7 | 14
): Promise<ForecastResponse> {
  const response = await fetch(
    `${API_URL}/forecast?horizon=${horizon}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Forecast API failed (${response.status}): ${error}`
    );
  }

  return response.json();
}

export async function getEvaluation(): Promise<EvaluationResponse> {
  const response = await fetch(`${API_URL}/evaluation`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Failed to fetch evaluation results: ${message}`
    );
  }

  return response.json();
}

export async function getDataExplorer(
  params: DataExplorerParams = {}
): Promise<DataExplorerResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const response = await fetch(
    `${API_URL}/data-explorer?${query.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ?? "Failed to fetch dataset records."
    );
  }

  return response.json();
}
