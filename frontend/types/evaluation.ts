
export interface ModelMetric {
  Model: string;
  MAE: number;
  RMSE: number;
  "WAPE (%)": number;
}

export interface TestModelMetric extends ModelMetric {
  Horizon: string;
}

export interface CategoryError {
  Model: string;
  "Room Category": string;
  MAE: number;
  "WAPE (%)": number;
  Bias: number;
  "Actual Demand": number;
  Observations: number;
}

export interface HotelError {
  model: string;
  hotel: string;
  MAE: number;
  Average_Error: number;
  Observations: number;
}

export interface EvaluationResponse {
  project: string;
  evaluation_type: string;

  validation_comparison: ModelMetric[];

  recursive_validation: {
    "7_day": ModelMetric[];
    "14_day": ModelMetric[];
  };

  test_comparison: TestModelMetric[];

  error_analysis: {
    by_room_category: CategoryError[];
    by_hotel: HotelError[];
  };

  selected_model: {
    name: string;
    reason: string;
  };

  limitations: string[];
}
