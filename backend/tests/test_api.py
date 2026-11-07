import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():

    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health():

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_invalid_horizon():

    response = client.get("/forecast?horizon=10")

    assert response.status_code == 422



def test_forecast_response():

    response = client.get("/forecast?horizon=7")

    assert response.status_code == 200

    result = response.json()

    assert result["horizon_days"] == 7
    assert result["model"] == "Recursive Persistence (Naive)"

    assert "forecast_origin" in result
    assert len(result["forecasts"]) > 0

    first_forecast = result["forecasts"][0]

    assert "occupied_date" in first_forecast
    assert "hotel" in first_forecast
    assert "room_category" in first_forecast
    assert "predicted_demand" in first_forecast

    assert first_forecast["predicted_demand"] >= 0

def test_14_day_forecast():

    response = client.get("/forecast?horizon=14")

    assert response.status_code == 200

    result = response.json()

    assert result["horizon_days"] == 14
    assert result["model"] == "Recursive Persistence (Naive)"
    assert len(result["forecasts"]) > 0


def test_forecast_by_hotel():

    response = client.get(
        "/forecast?horizon=7&hotel=City Hotel"
    )

    assert response.status_code == 200

    result = response.json()

    assert all(
        item["hotel"] == "City Hotel"
        for item in result["forecasts"]
    )


def test_forecast_by_room_category():

    response = client.get(
        "/forecast?horizon=7&room_category=A"
    )

    assert response.status_code == 200

    result = response.json()

    assert all(
        item["room_category"] == "A"
        for item in result["forecasts"]
    )


def test_invalid_hotel():

    response = client.get(
        "/forecast?horizon=7&hotel=Unknown Hotel"
    )

    assert response.status_code == 404


def test_invalid_room_category():

    response = client.get(
        "/forecast?horizon=7&room_category=UNKNOWN"
    )

    assert response.status_code == 404

def test_evaluation_endpoint():

    response = client.get("/evaluation")

    assert response.status_code == 200

    result = response.json()

    assert result["project"] == "StayCast"

    assert "validation_comparison" in result
    assert "recursive_validation" in result
    assert "test_comparison" in result
    assert "error_analysis" in result

    assert len(result["validation_comparison"]) > 0
    assert len(result["test_comparison"]) > 0

    assert (
        result["selected_model"]["name"]
        == "Recursive Persistence (Naive)"
    )

    assert len(result["error_analysis"]["by_room_category"]) > 0
    assert len(result["error_analysis"]["by_hotel"]) > 0
