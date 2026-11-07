
from pathlib import Path
from functools import lru_cache

import pandas as pd


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[3]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "daily_room_demand.csv"
)

TARGET = "occupied_room_nights"

GROUP_COLS = ["hotel", "room_category"]

SUPPORTED_HORIZONS = [7, 14]

MODEL_NAME = "Recursive Persistence (Naive)"


# --------------------------------------------------
# LOAD AND VALIDATE HISTORICAL DATA
# --------------------------------------------------

@lru_cache(maxsize=1)
def load_history():

    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Historical demand dataset not found: {DATA_PATH}"
        )

    data = pd.read_csv(DATA_PATH)

    if data.empty:
        raise ValueError("Historical demand dataset is empty.") 

    required_columns = [
        "occupied_date",
        "hotel",
        "room_category",
        TARGET
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in data.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Dataset is missing required columns: {missing_columns}"
        )

    data["occupied_date"] = pd.to_datetime(
        data["occupied_date"],
        errors="raise"
    )

    data[TARGET] = pd.to_numeric(
        data[TARGET],
        errors="raise"
    )

    if data[required_columns].isnull().any().any():
        raise ValueError(
            "Historical dataset contains missing required values."
        )

    if not data[TARGET].map(
        lambda value: pd.notna(value) and abs(value) != float("inf")
    ).all():
        raise ValueError(
            "Historical demand contains non-finite values."
        )

    if (data[TARGET] < 0).any():
        raise ValueError(
            "Historical demand cannot contain negative values."
        )

    if data.duplicated(
        subset=["occupied_date", *GROUP_COLS]
    ).any():
        raise ValueError(
            "Duplicate date and hotel/category combinations found."
        )

    data = data.sort_values(
        ["hotel", "room_category", "occupied_date"]
    ).reset_index(drop=True)

    # Each hotel/category series must have consecutive daily records.
    for key, group in data.groupby(GROUP_COLS):

        dates = group["occupied_date"].sort_values()

        differences = dates.diff().dropna()

        if not (differences == pd.Timedelta(days=1)).all():
            raise ValueError(
                f"Non-consecutive daily history found for {key}."
            )

    return data


# --------------------------------------------------
# RECURSIVE PERSISTENCE FORECAST
# --------------------------------------------------

def generate_forecast(
    horizon: int,
    hotel: str | None = None,
    room_category: str | None = None
):

    if horizon not in SUPPORTED_HORIZONS:
        raise ValueError(
            "Forecast horizon must be either 7 or 14 days."
        )

    data = load_history()

    last_date = data["occupied_date"].max()

    forecast_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=horizon,
        freq="D"
    )

    histories = {}

    # Create an independent history for every series.
    for (hotel_name, category), group in data.groupby(GROUP_COLS):

        if hotel and hotel_name != hotel:
            continue

        if room_category and category != room_category:
            continue

        histories[(hotel_name, category)] = (
            group.sort_values("occupied_date")[TARGET]
            .astype(float)
            .tolist()
        )

    results = []

    # Predict one date at a time.
    for forecast_date in forecast_dates:

        for (hotel_name, category), history in histories.items():

            # Persistence baseline:
            # Today's prediction equals the previous day's demand.
            prediction = max(0.0, history[-1])

            results.append({
                "occupied_date": forecast_date.date().isoformat(),
                "hotel": hotel_name,
                "room_category": category,
                "predicted_demand": round(prediction, 3)
            })

            # Append prediction, never an actual future observation.
            history.append(prediction)

    
    result_df = pd.DataFrame(results)

    return {
        "forecast_origin": last_date.date().isoformat(),

        "horizon_days": horizon,

        "model": MODEL_NAME,

        "methodology": (
            "Recursive persistence forecasting: "
            "each future day's prediction equals "
            "the previous day's observed or predicted demand."
        ),

        "target_definition": (
            "Daily reservation-night demand proxy, "
            "constructed from completed hotel stays. "
            "Each booking is treated as one room."
        ),

        "data_limitation": (
            "The historical dataset ends in August 2017. "
            "Forecasts beyond this period are historical-pattern "
            "extrapolations, not validated predictions of current "
            "hotel market demand."
        ),

        "forecasts": result_df.to_dict(orient="records")
    }
