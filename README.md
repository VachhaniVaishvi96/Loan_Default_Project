# Loan Default Prediction System (Lumen Credit)

Lumen Credit is a production-ready loan risk assessment platform built with a **scikit-learn Logistic Regression** scoring model, a **FastAPI** backend, and a **React + Vite** underwriting dashboard. It provides probability-first decision scoring, human-readable risk explanations, and an auditable SQLite prediction log.

---

## 📌 Quick Overview

- **Backend**: FastAPI (Python 3.11+) with Pydantic validation, joblib model loader, CORS middleware, and SQLite audit database.
- **Frontend**: React (Vite SPA) with interactive underwriting form, portfolio analytics dashboard, sample profiles, and decision intelligence panels.
- **Machine Learning**: Pre-computed Logistic Regression model (`backend/model/loan_default_model.pkl`) trained on 255,347 loan applications.

---

## 📁 Project Directory Structure

```text
Loan_Default_Project/
├── backend/                        <-- Root directory for Backend Deployment (Render/Railway)
│   ├── model/                      <-- Pre-computed model artifacts (<3 KB)
│   │   ├── loan_default_model.pkl  <-- Serialized Logistic Regression model
│   │   ├── scaler.pkl              <-- Standardized feature scaler
│   │   └── category_values.json    <-- Categorical mapping configuration
│   ├── main.py                     <-- FastAPI application & REST endpoints
│   ├── requirements.txt            <-- Python dependencies
│   ├── runtime.txt                 <-- Specifies Python 3.11.9 for cloud deployment
│   ├── Procfile                    <-- Production process launch command
│   └── loan_predictions.db         <-- SQLite audit trail
│
├── frontend/                       <-- Root directory for Frontend Deployment (Vercel/Netlify)
│   ├── src/
│   │   ├── config.js               <-- Dynamic API URL handler (Supports env variables)
│   │   ├── pages/                  <-- Underwriting Dashboard pages (Home, Predict, Insights, Models, About)
│   │   └── data.js                 <-- Sample profiles & option constants
│   ├── vercel.json                 <-- Vercel deployment configuration & SPA routing
│   ├── package.json                <-- Frontend Node dependencies
│   └── vite.config.js              <-- Vite build & dev proxy config
│
├── Loan_default.csv                <-- Dataset (for notebook exploration)
├── Loan_default.ipynb              <-- Jupyter training & EDA notebook
├── architecture.md                 <-- System architecture & request flow diagram
└── README.md                       <-- Project documentation & deployment guide
```

---

## 💻 Local Development Setup

Follow these steps to run the application locally on your machine:

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18 or higher with `npm`

---

### Step 1: Set Up & Run Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   - **Windows (PowerShell/CMD)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Mac / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

5. **Verify Backend**: Open `http://localhost:8000/docs` in your browser to test interactive Swagger API documentation.

---

### Step 2: Set Up & Run Frontend (React + Vite)

1. Open a **second terminal** window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. **Verify Frontend**: Open `http://localhost:5173` in your browser.
   *(During local development, Vite automatically proxies all `/api` requests to `http://127.0.0.1:8000`.)*

---

## 🌐 Step-by-Step Cloud Deployment Guide

Follow these step-by-step instructions to deploy the application online for free using **Render** (for Backend) and **Vercel** (for Frontend).

---

### 1. Deploying Backend to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following project settings:
   - **Name**: `loan-default-backend` (or your preferred name)
   - **Root Directory**: `backend` *(⚠️ CRITICAL: Must specify `backend` since code is in subfolder)*
   - **Environment / Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Expand **Advanced Settings** (Optional but recommended):
   - Add Environment Variable: `PYTHON_VERSION` = `3.11.9`
5. Click **Create Web Service**.
6. Wait for deployment to complete and copy your live backend URL (e.g., `https://loan-default-backend.onrender.com`).

---

### 2. Deploying Frontend to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend` *(⚠️ CRITICAL: Must specify `frontend`)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://loan-default-backend.onrender.com` *(Paste your live Render backend URL from Step 1)*
5. Click **Deploy**.
6. Once deployed, open your live Vercel link to test the live application!

---

### Alternative: Deploying Frontend to Netlify

1. Log in to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** -> **Import an existing project**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Under Environment Variables, add:
   - `VITE_API_BASE_URL` = `https://loan-default-backend.onrender.com`
5. Click **Deploy site**.

---

## 🛠️ Common Deployment Errors & Solutions

If you encounter an error during or after deployment, check the troubleshooting solutions below:

### ❌ Issue 1: "Cannot reach FastAPI" / Network Error on Frontend
- **Symptom**: Submitting an application shows `"Cannot reach FastAPI"` or browser console shows CORS/Fetch errors.
- **Cause**: The deployed React app is attempting to fetch `/api/predict` on the Vercel domain instead of the Render backend URL.
- **Fix**:
  1. Open Vercel Dashboard -> Project Settings -> **Environment Variables**.
  2. Add `VITE_API_BASE_URL` with your Render URL: `https://your-backend.onrender.com`.
  3. Trigger a **Redeploy** on Vercel so the environment variable is bundled into the Vite production build.
  4. Alternatively, edit [`frontend/src/config.js`](file:///d:/DOWNLOAD/SEM-5/Loan_Default_Project/frontend/src/config.js) directly and set your Render URL.

---

### ❌ Issue 2: `404: NOT_FOUND` Page on Refresh on Vercel
- **Symptom**: Navigating directly to `/predict` or refreshing the page gives a `404: NOT_FOUND` error.
- **Cause**: Single-Page Application (SPA) routes are managed by React Router. When refreshing, Vercel tries to find a physical `predict.html` file.
- **Fix**: Ensure [`frontend/vercel.json`](file:///d:/DOWNLOAD/SEM-5/Loan_Default_Project/frontend/vercel.json) contains rewrite rules (already included in this repository):
  ```json
  {
    "framework": "vite",
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

---

### ❌ Issue 3: Render Build Fails with `requirements.txt not found` or `main.py not found`
- **Symptom**: Render build logs fail with `FileNotFoundError: No such file or directory: 'requirements.txt'`.
- **Cause**: Render defaults to searching the repository root, but backend files are inside `backend/`.
- **Fix**: In Render Web Service settings, verify **Root Directory** is set to `backend`.

---

### ❌ Issue 4: Python Version / `scikit-learn` Pickle Incompatibility on Render
- **Symptom**: `ValueError: ... scikit-learn version mismatch` or `ModuleNotFoundError` during startup.
- **Cause**: Cloud providers may default to older Python versions (3.7/3.8) that do not support scikit-learn 1.6+.
- **Fix**: This repository includes [`backend/runtime.txt`](file:///d:/DOWNLOAD/SEM-5/Loan_Default_Project/backend/runtime.txt) set to `python-3.11.9`. Also ensure `PYTHON_VERSION` is set to `3.11.9` in Render environment variables.

---

### ❌ Issue 5: Port Binding Failure on Backend Deployment (`$PORT`)
- **Symptom**: Backend service crashes on startup with `Address already in use` or binding timeout.
- **Cause**: Cloud platforms dynamically assign a port via `$PORT` environment variable.
- **Fix**: Ensure your Start Command uses `$PORT`:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

---

### ❌ Issue 6: PowerShell `npm run build` Execution Error on Windows
- **Symptom**: `npm : File ... npm.ps1 cannot be loaded because running scripts is disabled on this system`.
- **Fix**: Run the build command via CMD (`cmd /c npm run build`) or grant PowerShell execution permissions:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

---

## 📡 API Routes Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint (returns status, loaded model & database connection) |
| `GET` | `/api/data` | Dataset statistics (row count, feature list, default rate) |
| `GET` | `/api/analytics` | Portfolio decision metrics (total predictions, approval %, risk breakdown) |
| `GET` | `/api/predictions?limit=25` | Prediction audit history retrieved from SQLite |
| `POST` | `/api/predict` | Scores applicant, computes default risk %, returns decision & explanation |
| `GET` | `/docs` | Interactive Swagger API Documentation |

---

## 📊 Underwriting & Model Methodology

- **Model**: Logistic Regression (scikit-learn) with Standard Scaling
- **Training Data**: 255,347 loan applications across 16 features
- **Risk Assessment Thresholds**:
  - 🟢 **Low Risk**: Default probability < 18%
  - 🟡 **Medium Risk**: Default probability 18% - 35%
  - 🔴 **High Risk**: Default probability > 35%
- **Audit & Persistence**: Every completed prediction is stored with applicant inputs, calculated risk category, probability score, and timestamp in SQLite (`loan_predictions.db`).
