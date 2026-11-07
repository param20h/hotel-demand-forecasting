from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from pathlib import Path
import os
import pandas as pd
from app.ml.forecasting import generate_forecast
from app.schemas.forecast import ForecastResponse
from app.ml.evaluation import generate_evaluation_report


app = FastAPI(
    title="Hotel Demand Forecasting API",
    description="ML-powered hotel reservation-night demand forecasting",
    version="1.0.0"
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():

    return {
        "message": "Hotel Demand Forecasting API",
        "status": "running"
    }


@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "forecasting-api"
    }


@app.get(
    "/forecast",
    response_model=ForecastResponse,
    summary="Generate hotel reservation-night demand forecasts",
    description="""
    Generates recursive persistence forecasts for hotel demand.

    Supported horizons:
    - 7 days
    - 14 days

    Optional filters:
    - hotel
    - room_category

    Predictions are based on historical reservation-night demand.
    They are not live hotel occupancy predictions.
    """
)
def forecast(
    horizon: Annotated[int, Query(ge=7, le=14)] = 7,
    hotel: str | None = None,
    room_category: str | None = None
):

    if horizon not in [7, 14]:
        raise HTTPException(
            status_code=422,
            detail="Horizon must be either 7 or 14 days."
        )

    try:
        result = generate_forecast(
            horizon=horizon,
            hotel=hotel,
            room_category=room_category
        )

        if not result["forecasts"]:
            raise HTTPException(
                status_code=404,
                detail="No matching hotel or room category found."
            )

        return result

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

@app.get(
    "/evaluation",
    summary="Get ML model evaluation results",
    description="""
    Returns saved validation metrics, recursive validation metrics,
    held-out test metrics, and error analysis by hotel and room category.

    These are historical experiment results loaded from CSV reports.
    """
)
def evaluation():

    try:
        return generate_evaluation_report()

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@app.get("/data-explorer")
def get_data_explorer(
    hotel: str | None = Query(default=None),
    room_category: str | None = Query(default=None),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    project_root = Path(__file__).resolve().parents[2]
    csv_path = (
        project_root
        / "data"
        / "processed"
        / "daily_room_demand.csv"
    )

    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Processed daily demand dataset was not found.",
        )

    try:
        df = pd.read_csv(csv_path)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read processed dataset: {exc}",
        )

    required_columns = {
        "occupied_date",
        "hotel",
        "room_category",
        "occupied_room_nights",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise HTTPException(
            status_code=500,
            detail=f"Dataset is missing columns: {sorted(missing_columns)}",
        )

    df["occupied_date"] = pd.to_datetime(
        df["occupied_date"],
        errors="coerce",
    )

    df["occupied_room_nights"] = pd.to_numeric(
        df["occupied_room_nights"],
        errors="coerce",
    )

    df = df.dropna(
        subset=[
            "occupied_date",
            "hotel",
            "room_category",
            "occupied_room_nights",
        ]
    )

    # Filters
    if hotel:
        df = df[df["hotel"].astype(str) == hotel]

    if room_category:
        df = df[
            df["room_category"].astype(str) == room_category
        ]

    if start_date:
        try:
            start = pd.to_datetime(start_date, errors="raise")
            df = df[df["occupied_date"] >= start]
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail="Invalid start_date. Use YYYY-MM-DD.",
            )

    if end_date:
        try:
            end = pd.to_datetime(end_date, errors="raise")
            df = df[df["occupied_date"] <= end]
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail="Invalid end_date. Use YYYY-MM-DD.",
            )

    if search:
        mask = (
            df["hotel"].astype(str).str.contains(
                search, case=False, na=False
            )
            | df["room_category"].astype(str).str.contains(
                search, case=False, na=False
            )
            | df["occupied_date"].astype(str).str.contains(
                search, case=False, na=False
            )
        )
        df = df[mask]

    # Sort newest first
    df = df.sort_values("occupied_date", ascending=False)

    total_records = len(df)
    total_demand = float(df["occupied_room_nights"].sum())
    average_demand = (
        float(df["occupied_room_nights"].mean()) if total_records else 0.0
    )

    # Filter options from the full dataset
    all_df = pd.read_csv(csv_path)

    available_hotels = sorted(
        all_df["hotel"].dropna().astype(str).unique().tolist()
    )

    available_categories = sorted(
        all_df["room_category"].dropna().astype(str).unique().tolist()
    )

    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    page_df = df.iloc[start_index:end_index].copy()

    page_df["occupied_date"] = (
        page_df["occupied_date"].dt.strftime("%Y-%m-%d")
    )

    records = page_df[
        ["occupied_date", "hotel", "room_category", "occupied_room_nights"]
    ].to_dict(orient="records")

    return {
        "records": records,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": (
                (total_records + page_size - 1) // page_size
            ),
        },
        "summary": {
            "total_demand": round(total_demand, 2),
            "average_demand": round(average_demand, 2),
            "record_count": total_records,
        },
        "filters": {
            "hotels": available_hotels,
            "room_categories": available_categories,
        },
    }
