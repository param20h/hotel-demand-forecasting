
from pydantic import BaseModel
from typing import List


class ForecastPoint(BaseModel):
    occupied_date: str
    hotel: str
    room_category: str
    predicted_demand: float


class ForecastResponse(BaseModel):
    forecast_origin: str
    horizon_days: int
    model: str

    methodology: str
    target_definition: str
    data_limitation: str

    forecasts: List[ForecastPoint]
