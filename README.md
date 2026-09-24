# Loan Default Prediction System (Lumen Credit)

Lumen Credit is a production-ready loan risk assessment platform built around scikit-learn Logistic Regression model scoring, FastAPI, and React. It features probability-first decision scoring, human-readable explanations, and an auditable prediction history.

## Project Structure

```text
Loan_Default_Project/
├── backend/                        <-- Deploy Root for Render
│   ├── model/                      <-- Pre-computed lightweight artifacts (<3 KB)
│   │   ├── loan_default_model.pkl
│   │   ├── scaler.pkl
│   │   └── category_values.json
│   ├── main.py                     <-- FastAPI Backend Service
│   ├── requirements.txt            <-- Backend Python dependencies
│   ├── Procfile                    <-- Deployment execution command
│   ├── .env.example                <-- Backend Environment Template
│   └── loan_predictions.db         <-- SQLite audit trail
│
├── frontend/                       <-- Deploy Root for Vercel
│   ├── src/
│   │   ├── config.js               <-- Centralized VITE_API_BASE_URL handler
│   │   ├── pages/                  <-- Underwriting Dashboard pages
│   │   └── data.js
│   ├── vercel.json                 <-- Vercel SPA route rewrite configuration
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example                <-- Frontend Environment Template
│
├── Loan_default.csv                <-- Original dataset (for notebook / training)
├── Loan_default.ipynb              <-- Model exploration notebook
└── README.md
```

---

## Deployment Instructions

### 1. Backend Deployment (Render)

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub Repository.
3. Configure the following settings:
   - **Name**: `loan-default-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:5173`
   - `LOG_LEVEL`: `INFO`
5. Click **Create Web Service**. Note your backend URL (e.g. `https://loan-default-backend.onrender.com`).

---

### 2. Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
2. Import your GitHub Repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
4. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://loan-default-backend.onrender.com` (Your Render backend URL)
5. Click **Deploy**.

---

## Local Development

### Backend (FastAPI)
```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```
Interactive API Swagger Docs: `http://localhost:8000/docs`

### Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
Frontend App: `http://localhost:5173`

---

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Model and database health check |
| `GET` | `/api/data` | Dataset metadata |
| `GET` | `/api/analytics` | Dashboard prediction metrics |
| `GET` | `/api/predictions?limit=25` | Prediction audit history |
| `POST` | `/api/predict` | Score application, compute risk, return explanation & persist |
