
export interface ForecastPoint {
  occupied_date: string;
  hotel: string;
  room_category: string;
  predicted_demand: number;
}

export interface ForecastResponse {
  forecast_origin: string;
  horizon_days: number;
  model: string;
  methodology: string;
  target_definition: string;
  data_limitation: string;
  forecasts: ForecastPoint[];
}
