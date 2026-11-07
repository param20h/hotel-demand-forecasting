
from pathlib import Path

import pandas as pd


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[3]

REPORTS_DIR = BASE_DIR / "reports"

REPORT_FILES = {
    "validation_comparison": "validation_model_comparison.csv",
    "recursive_validation_7d": "day6_7day_forecast_metrics.csv",
    "recursive_validation_14d": "day6_14day_forecast_metrics.csv",
    "test_comparison": "final_test_model_comparison.csv",
    "category_errors": "test_category_metrics_7d.csv",
    "hotel_errors": "test_hotel_error_analysis_7d.csv",
}


# --------------------------------------------------
# CSV LOADER
# --------------------------------------------------

def load_report(filename: str) -> list[dict]:

    path = REPORTS_DIR / filename

    if not path.exists():
        raise FileNotFoundError(
            f"Evaluation report not found: {path}"
        )

    df = pd.read_csv(path)

    if df.empty:
        raise ValueError(
            f"Evaluation report is empty: {filename}"
        )

    # Convert NumPy/Pandas values into JSON-compatible values.
    df = df.astype(object).where(pd.notna(df), None)

    return df.to_dict(orient="records")


# --------------------------------------------------
# EVALUATION SERVICE
# --------------------------------------------------

def generate_evaluation_report():

    reports = {}

    for report_key, filename in REPORT_FILES.items():

        reports[report_key] = load_report(filename)

    return {
        "project": "StayCast",
        "evaluation_type": "Historical model evaluation",

        "validation_comparison": reports["validation_comparison"],

        "recursive_validation": {
            "7_day": reports["recursive_validation_7d"],
            "14_day": reports["recursive_validation_14d"],
        },

        "test_comparison": reports["test_comparison"],

        "error_analysis": {
            "by_room_category": reports["category_errors"],
            "by_hotel": reports["hotel_errors"],
        },

        "selected_model": {
            "name": "Recursive Persistence (Naive)",
            "reason": (
                "The Naive baseline achieved the lowest MAE, "
                "RMSE and WAPE on the held-out test set "
                "for both 7-day and 14-day recursive forecasts."
            ),
        },

        "limitations": [
            "Evaluation results are based on historical data.",
            "The source dataset ends in August 2017.",
            "These results do not establish current hotel-market accuracy.",
            "Room-category error estimates have different observation counts.",
        ],
    }
