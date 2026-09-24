# Lumen Credit

Lumen Credit is a portfolio-ready loan risk assessment platform built around the existing Logistic Regression artifact and `Loan_default.csv`. It presents probability-first decisions, human-readable explanations, and an auditable SQLite history rather than hiding the model behind a binary label.

## Stack

- React + Vite frontend with responsive underwriting dashboard
- FastAPI backend with OpenAPI/Swagger at `/docs`
- scikit-learn Logistic Regression with the 16 dataset features
- SQLite prediction audit trail
- Pydantic request validation, structured logging, CORS, and a per-client prediction rate limit

## Project structure

```text
Loan_Default_Project/
  backend/
    main.py
    requirements.txt
    loan_predictions.db       # created on first API start
  frontend/
    src/
      components/Layout.jsx
      pages/Home.jsx           # analytics command center
      pages/Predict.jsx        # assessment workflow
      pages/Insights.jsx
      pages/About.jsx
      data.js
      index.css
    package.json
    vite.config.js
  Loan_default.csv
  Loan_default.pkl             # current model artifact
  .env.example
  architecture.md
```

## Run locally

1. Create a Python environment and install the API dependencies:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r backend\requirements.txt
   ```

2. Start the API from the project root:

   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```

3. Start the frontend in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:5173`. API documentation is available at `http://127.0.0.1:8000/docs`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Model and database health check |
| GET | `/api/data` | Dataset and feature metadata |
| GET | `/api/analytics` | Dashboard totals, approval percentage, recent scores |
| GET | `/api/predictions?limit=25` | Auditable prediction history |
| POST | `/api/predict` | Validate, score, explain, and persist an application |

`POST /api/predict` returns `loan_status`, `probability_score`, `risk_category`, `explanation`, `model_version`, and an audit `id`. Risk categories are Low Risk, Medium Risk, and High Risk.

## Configuration and security

Copy `.env.example` to `.env` in the deployment environment. The API reads `CORS_ORIGINS`, `DATABASE_PATH`, `RATE_LIMIT_PER_MINUTE`, and `LOG_LEVEL`. Inputs use strict Pydantic bounds and reject unknown fields. Text fields are trimmed and constrained; prediction requests are rate limited per client IP. For a multi-instance production deployment, move rate limiting and SQLite to managed services.

Do not commit secrets, production databases, or model credentials. The current SQLite file is appropriate for a single Render instance or demo; use a managed PostgreSQL database when horizontal scaling or durable storage is required.

## Deployment

### Backend on Render

1. Create a new Web Service connected to this repository.
2. Runtime: Python 3.11+.
3. Build command: `pip install -r backend/requirements.txt`.
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
5. Add environment variables from `.env.example`; set `CORS_ORIGINS` to the exact Vercel URL.
6. Add a Render persistent disk mounted at `/var/data` and set `DATABASE_PATH=/var/data/loan_predictions.db` if prediction history must survive deploys.
7. Verify `/api/health` and `/docs` before connecting the frontend.

### Frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to `frontend`.
3. Build command: `npm run build`; output directory: `dist`.
4. Add `VITE_API_URL=https://your-render-service.onrender.com` if deploying without a rewrite.
5. For the current Vite proxy setup, update `frontend/vite.config.js` for production or use a Vercel rewrite so `/api/*` forwards to the Render URL.
6. Add a SPA fallback rewrite to `/index.html` so React Router routes work on refresh.

For production API URLs, replace the frontend fetch paths with `${import.meta.env.VITE_API_URL}/api/...` or configure the Vercel rewrite. Never expose private credentials in `VITE_*` variables.

## Industry-level portfolio features

- Probability-first risk communication instead of accuracy-only claims
- Explanation factors tied to affordability, credit quality, and employment stability
- Model version and assessment ID on every result
- SQLite audit history and analytics API
- Health checks and OpenAPI documentation
- Configurable CORS and rate limiting
- Clear limitation language for human review and fairness governance
- Deployment path that distinguishes demo SQLite from scalable managed persistence

## Limitations

This is decision support, not a regulated lending policy. The existing model and label encoding should be retrained with a reproducible pipeline, calibration, fairness evaluation, drift monitoring, and an approved threshold policy before use with real applicants.
