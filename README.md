# Loan Default Prediction System (Lumen Credit)

Lumen Credit is a production-ready loan risk assessment platform built around scikit-learn Logistic Regression model scoring, FastAPI, and React. It features probability-first decision scoring, human-readable explanations, and an auditable prediction history.

> [!NOTE]
> **Zero Environment Variable Setup**: This application does not require any `.env` or environment variables for deployment. All configuration defaults are handled directly in the code to ensure smooth, zero-error deployments on Render, Vercel, or local machines.

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
│   └── loan_predictions.db         <-- SQLite audit trail
│
├── frontend/                       <-- Deploy Root for Vercel
│   ├── src/
│   │   ├── config.js               <-- Centralized API URL handler (No env variables needed)
│   │   ├── pages/                  <-- Underwriting Dashboard pages
│   │   └── data.js
│   ├── vercel.json                 <-- Vercel SPA route rewrite configuration
│   ├── package.json
│   └── vite.config.js
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
4. Click **Create Web Service**. *(No environment variables needed! CORS and database paths are configured automatically.)*
5. Copy your deployed backend URL (e.g., `https://loan-default-backend.onrender.com`).

---

### 2. Frontend Deployment (Vercel)

1. *(Optional)* If your backend is deployed on a separate domain (e.g. Render), open [`frontend/src/config.js`](file:///d:/DOWNLOAD/SEM-5/Loan_Default_Project/frontend/src/config.js) and set your deployed URL:
   ```javascript
   export const API_BASE_URL = "https://loan-default-backend.onrender.com";
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import your GitHub Repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
5. Click **Deploy**. *(No environment variables required!)*

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

*(During local dev, Vite automatically proxies all `/api` requests to `http://127.0.0.1:8000` with zero configuration needed.)*

---

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Model and database health check |
| `GET` | `/api/data` | Dataset metadata |
| `GET` | `/api/analytics` | Dashboard prediction metrics |
| `GET` | `/api/predictions?limit=25` | Prediction audit history |
| `POST` | `/api/predict` | Score application, compute risk, return explanation & persist |
