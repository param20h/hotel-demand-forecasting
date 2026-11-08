# StayCast — Hotel Occupancy & Room-Demand Forecasting

**An ML-powered hotel demand forecasting and analytics platform.**

StayCast is a full-stack machine learning application designed to forecast hotel room-demand patterns using historical booking data. It provides 7-day and 14-day demand forecasts, hotel-level analytics, room-category analysis, model evaluation, and an interactive dataset explorer.

The project combines a Python-based forecasting backend with a Next.js analytics dashboard to make historical demand patterns and model predictions accessible through an intuitive interface.

> **Important:** The project forecasts reservation-night demand, not verified physical hotel occupancy or occupancy percentages. The available dataset does not contain verified hotel room capacity or historical booking-on-hand snapshots.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Dataset](#dataset)
- [Data Processing](#data-processing)
- [Machine Learning Methodology](#machine-learning-methodology)
- [Model Evaluation](#model-evaluation)
- [Application Modules](#application-modules)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Deployment](#deployment)
- [Running Tests](#running-tests)
- [Limitations and Responsible Use](#limitations-and-responsible-use)
- [Future Improvements](#future-improvements)

---

## Project Overview

Hotels need reliable demand estimates to support room allocation, staffing, operational planning, and resource management.

StayCast explores how historical reservation data and calendar-based features can be used to estimate future room-night demand.

The application provides:

- 7-day and 14-day demand forecasts.
- Hotel-wise demand comparisons.
- Room-category demand analysis.
- Historical demand exploration.
- Machine learning model evaluation.
- Interactive charts and analytics.

The project follows a reproducible machine learning workflow, from raw booking data processing to model evaluation and API-based inference.

---

## Features

### 1. Dashboard

Provides an overview of the forecasting system, including demand summaries and forecast information.

### 2. Forecast Analytics

- Compare 7-day and 14-day forecast horizons.
- Visualize daily predicted demand.
- Analyse demand by hotel.
- Compare room-category demand.
- Inspect the forecasting methodology.

### 3. Hotel Analytics

- Compare City Hotel and Resort Hotel.
- Analyse predicted room-night demand.
- Explore hotel-wise daily demand.
- Inspect room-category demand within each property.

### 4. Room Categories

- Rank room categories by predicted demand.
- Compare demand across hotel properties.
- Explore daily demand trends.
- Inspect category-level demand distribution.

### 5. Model Evaluation

- Compare candidate forecasting models.
- Review MAE, RMSE, and WAPE.
- Analyse recursive validation results.
- Inspect held-out test performance.
- Explore errors by hotel and room category.

### 6. Data Explorer

- Browse processed historical demand records.
- Filter by hotel and room category.
- Filter by date range.
- Search dataset records.
- Navigate through paginated results.
- Export the current page as CSV.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Visualization | Recharts |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Data Processing | Pandas, NumPy |
| Machine Learning | Scikit-learn, XGBoost |
| Model Persistence | Joblib |
| Testing | Pytest |
| Dataset | Hotel Booking Demand Dataset |

---

## System Architecture

```text
                  Historical Booking Dataset
                            |
                            v
                    Data Processing
                            |
                            v
                  Daily Demand Dataset
                            |
                            v
                  Feature Engineering
                            |
                            v
                  Model Development
                            |
                            v
                  Model Evaluation
                            |
                            v
                 Selected Forecast Model
                            |
                            v
                     FastAPI Backend
                            |
                -----------------------
                |                     |
                v                     v
            Forecast API         Evaluation API
                |                     |
                -----------------------
                            |
                            v
                    Next.js Frontend
                            |
                -----------------------
                |                     |
                v                     v
          Analytics Dashboard     Data Explorer
```

### Architecture Design

The backend handles:

- Historical data processing and access.
- Forecast generation.
- Evaluation report retrieval.
- API request validation.
- Data filtering and pagination.

The frontend handles:

- API communication.
- Forecast visualization.
- Interactive filtering.
- Analytics dashboards.
- Dataset exploration.

---

## Dataset

StayCast uses the publicly available **Hotel Booking Demand Dataset**.

**Original research:**

Nuno António, Ana de Almeida, and Luis Nunes.

Dataset publication: *Hotel Booking Demand Datasets.*

- [Official dataset publication](https://repositorio.iscte-iul.pt/entities/publication/51239f26-5dd3-4477-bf84-cbfb435d0576)
- [Research DOI](https://doi.org/10.1016/j.dib.2018.11.126)
- [Kaggle dataset mirror](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand)

### Dataset Characteristics

| Attribute | Description |
|---|---|
| Original records | 119,390 |
| Hotel types | City Hotel, Resort Hotel |
| Historical period | July 2015 – August 2017 |
| Data type | Booking-level records |
| Target used | Daily reservation-night demand |
| Room grouping | Reserved room category |

The dataset contains historical booking information, including arrival dates, length of stay, hotel type, and reserved room type.

### Target Definition

The prediction target is:

**Daily reservation-night demand by hotel and reserved room category.**

Completed stays are expanded into individual occupied nights.

The checkout date is excluded because it is not an occupied night.

Cancelled bookings and zero-night stays are not included in the completed-stay demand aggregation.

The resulting dataset is aggregated by:

- `occupied_date`
- `hotel`
- `room_category`

The demand column is:

`occupied_room_nights`

---

## Data Processing

The processing pipeline includes:

1. Load the original booking dataset.
2. Inspect missing values and data quality.
3. Filter completed stays.
4. Remove zero-night stays.
5. Expand each completed booking into individual occupied nights.
6. Exclude checkout dates.
7. Aggregate reservation nights by date, hotel, and reserved room category.
8. Create a complete daily time series and fill missing demand dates with zero.
9. Save the processed dataset.

### Feature Engineering

The forecasting experiments use calendar and historical demand features.

| Feature | Description |
|---|---|
| Day of week | Day of the week |
| Day of year | Position in the calendar year |
| Lag 1 | Previous day's demand |
| Lag 7 | Demand seven days earlier |
| Lag 14 | Demand fourteen days earlier |
| Lag 28 | Demand twenty-eight days earlier |
| Rolling mean 7 | Seven-day rolling average |
| Rolling mean 14 | Fourteen-day rolling average |
| Rolling mean 28 | Twenty-eight-day rolling average |
| Rolling standard deviation 7 | Seven-day demand variability |

Features are generated using chronological historical information to avoid using future observations.

For multi-day forecasts, predictions are generated recursively so that future lag features use earlier predictions rather than actual future demand.

---

## Machine Learning Methodology

Three forecasting approaches were evaluated.

### 1. Random Forest

A tree-based ensemble model used to capture nonlinear relationships between calendar features and historical demand.

### 2. XGBoost

A gradient-boosting model evaluated for its ability to learn complex demand patterns.

### 3. Naive Persistence Baseline

The baseline predicts future demand using the most recently observed demand.

For recursive multi-day prediction, each prediction becomes the historical input for the following forecast step.

### Temporal Validation Strategy

The dataset is divided chronologically:

- 70% Training
- 15% Validation
- 15% Testing

Random train-test splitting is avoided because it can introduce temporal leakage.

Candidate models are evaluated on validation data, and final performance is measured on the held-out test period.

---

## Model Evaluation

The project uses three evaluation metrics.

| Metric | Purpose |
|---|---|
| MAE | Mean Absolute Error |
| RMSE | Root Mean Squared Error |
| WAPE | Weighted Absolute Percentage Error |

### Held-out Test Results

#### 7-Day Forecast

| Model | MAE | RMSE | WAPE |
|---|---:|---:|---:|
| Naive Persistence | 2.619 | 7.463 | 13.231% |
| Random Forest | 3.026 | 8.343 | 15.287% |
| XGBoost | 3.160 | 8.253 | 15.966% |

#### 14-Day Forecast

| Model | MAE | RMSE | WAPE |
|---|---:|---:|---:|
| Naive Persistence | 3.147 | 9.102 | 15.898% |
| Random Forest | 3.393 | 9.481 | 17.143% |
| XGBoost | 3.578 | 9.323 | 18.078% |

### Selected Model

**Recursive Persistence (Naive Baseline)**

The Naive Persistence baseline achieved the lowest MAE, RMSE, and WAPE on the held-out test set for both forecast horizons.

Although Random Forest and XGBoost were competitive during parts of validation, they did not outperform the persistence baseline on the final test evaluation.

Selecting the simpler model is therefore justified by the observed test results rather than assuming that a more complex model must perform better.

### Error Analysis

Additional analysis is performed by:

- Hotel property.
- Reserved room category.
- Forecast horizon.
- Prediction error.

Low-volume categories may show higher WAPE despite relatively small absolute errors. Therefore, percentage errors should be interpreted alongside actual demand and MAE.

---

## Application Modules

| Module | Route | Description |
|---|---|---|
| Dashboard | `/` | Overall demand overview |
| Forecast Analytics | `/forecast-analytics` | Forecast visualizations |
| Model Evaluation | `/evaluation` | Model comparison and errors |
| Hotels | `/hotels` | Hotel-level demand analysis |
| Room Categories | `/room-categories` | Room-category analytics |
| Data Explorer | `/data-explorer` | Historical dataset inspection |

---

## API Documentation

The backend exposes REST APIs through FastAPI.

### Health Check

```http
GET /health
```

Checks whether the backend service is running.

### Generate Forecast

```http
GET /forecast?horizon=7
```

Generates a 7-day demand forecast.

Supported horizons:

- `7`
- `14`

### Evaluation Results

```http
GET /evaluation
```

Returns model comparison metrics, recursive validation results, test results, and error analysis.

### Data Explorer

```http
GET /data-explorer?page=1&page_size=20
```

Returns processed historical demand records.

Supported query parameters:

| Parameter | Description |
|---|---|
| `hotel` | Filter by hotel |
| `room_category` | Filter by room category |
| `start_date` | Start date |
| `end_date` | End date |
| `search` | Search records |
| `page` | Page number |
| `page_size` | Number of records per page |

Interactive API documentation is available at:

`http://localhost:8000/docs`

---

## Project Structure

```text
hotel-demand-forecasting/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ml/
│   │   └── main.py
│   │
│   ├── artifacts/
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── evaluation/
│   │   ├── forecast-analytics/
│   │   ├── hotels/
│   │   ├── room-categories/
│   │   └── data-explorer/
│   │
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── external/
│
├── notebooks/
├── scripts/
├── docs/
├── reports/
│
├── .gitignore
└── README.md
```

---

## Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd hotel-demand-forecasting
```

### 2. Backend Setup

Create and activate a virtual environment:

```bash
cd backend

python -m venv venv
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

`http://localhost:8000`

API documentation:

`http://localhost:8000/docs`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start Next.js:

```bash
npm run dev
```

Frontend:

`http://localhost:3000`

### 4. Dataset Setup

Place the original dataset in:

```text
data/raw/
```

The processed daily demand dataset should be available at:

```text
data/processed/daily_room_demand.csv
```

The backend requires this processed file for forecast generation and dataset exploration.

Follow the project's preprocessing scripts or notebooks to reproduce it.

---

## Deployment

The repository is configured as a Vercel multi-service project in [`vercel.json`](./vercel.json):

- `frontend` is the public Next.js service for all non-API paths.
- `staycast-api` is the public FastAPI service under `/api/*`.
- The frontend uses the same-origin `/api` path, so no backend hostname or service binding is needed for browser requests.

Import the repository into Vercel and use the inferred multi-service configuration. The tracked
`data/processed/daily_room_demand.csv` file is required by the forecast and data-explorer endpoints.
The existing [`render.yaml`](./render.yaml) remains available for deployments that keep the backend on Render.

Raw source data and locally generated model artifacts are intentionally excluded from deployment.

---

## Running Tests

### Backend Tests

From the backend directory:

```bash
pytest -v
```

The current backend test suite covers:

- Root endpoint.
- Health endpoint.
- Invalid forecast horizons.
- Forecast response.
- 7-day and 14-day forecasts.
- Hotel filtering.
- Room-category filtering.
- Invalid filter values.
- Evaluation endpoint.

**Latest local verification:** 10 backend tests passed.

### Frontend TypeScript Validation

From the frontend directory:

```bash
npx tsc --noEmit
```

**Latest local verification:** TypeScript validation passed.

---

## Limitations and Responsible Use

### Historical Data Limitations

The dataset covers July 2015 to August 2017. It does not represent current hotel market conditions.

Predictions for dates far beyond the historical period should be treated as historical-pattern extrapolations, not reliable live market forecasts.

### Occupancy Measurement

The project estimates reservation-night demand.

It does not have verified physical room capacity, so occupancy percentages cannot be reliably calculated.

### Booking Information

The dataset does not provide historical booking-on-hand snapshots. Consequently, the system cannot reconstruct what the hotel knew about future reservations at every historical forecasting origin.

### Forecasting Limitations

The selected persistence baseline is intentionally simple. It may not capture:

- Seasonal demand changes.
- Special events.
- Local holidays.
- Sudden market changes.
- Pricing and promotional effects.
- External demand shocks.

### Responsible Use

Forecasts should support human decision-making rather than automatically determine staffing, pricing, or room allocation.

The application should not be treated as a replacement for a live hotel property management system.

---

## Future Improvements

Potential extensions include:

- Integration with live hotel booking systems.
- Historical booking-on-hand data.
- Room-capacity integration for occupancy estimation.
- Holiday and event calendar features.
- Confidence intervals and uncertainty estimates.
- Additional seasonal forecasting models.
- Automated model retraining.
- Forecast monitoring and drift detection.
- Production deployment and monitoring.
- Role-based access control.

---

## Project Information

**Project:** StayCast — Hotel Occupancy & Room-Demand Forecasting

**Organization:** ALGIONS AI LABS PRIVATE LIMITED

**Project Type:** Machine Learning / Full-Stack Analytics

**Backend:** FastAPI

**Frontend:** Next.js

**Primary Objective:** Forecast hotel reservation-night demand and provide interactive analytics for historical and predicted demand patterns.

---

*StayCast — Turning historical booking data into actionable demand insights.*
