import json
import logging
import sqlite3
import time
from collections import defaultdict, deque
from pathlib import Path
from threading import Lock

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent
MODEL_DIR = BACKEND_DIR / "model"
MODEL_PATH = MODEL_DIR / "loan_default_model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
CATEGORIES_PATH = MODEL_DIR / "category_values.json"
DATA_PATH = ROOT_DIR / "Loan_default.csv"
DB_PATH = BACKEND_DIR / "loan_predictions.db"
FEATURES = ["age", "income", "loan_amount", "credit_score", "months_employed", "num_credit_lines", "interest_rate", "loan_term", "dti_ratio", "education", "employment_type", "marital_status", "has_mortgage", "has_dependents", "loan_purpose", "has_cosigner"]
logger = logging.getLogger("lumen-credit")
logging.basicConfig(level="INFO", format="%(asctime)s %(levelname)s %(name)s %(message)s")


class LoanApplication(BaseModel):
    model_config = ConfigDict(extra="forbid")
    Age: int = Field(ge=18, le=100)
    Income: float = Field(gt=0, le=10_000_000)
    LoanAmount: float = Field(gt=0, le=10_000_000)
    CreditScore: int = Field(ge=300, le=850)
    MonthsEmployed: int = Field(ge=0, le=600)
    NumCreditLines: int = Field(ge=0, le=100)
    InterestRate: float = Field(ge=0, le=100)
    LoanTerm: int = Field(ge=1, le=480)
    DTIRatio: float = Field(ge=0, le=1)
    Education: str = Field(min_length=2, max_length=40)
    EmploymentType: str = Field(min_length=2, max_length=40)
    MaritalStatus: str = Field(min_length=2, max_length=40)
    HasMortgage: str = Field(pattern="^(Yes|No)$")
    HasDependents: str = Field(pattern="^(Yes|No)$")
    LoanPurpose: str = Field(min_length=2, max_length=40)
    HasCoSigner: str = Field(pattern="^(Yes|No)$")
    PreviousDefaults: int = Field(default=0, ge=0, le=50)

    @field_validator("Education", "EmploymentType", "MaritalStatus", "LoanPurpose")
    @classmethod
    def clean_text(cls, value: str) -> str:
        return " ".join(value.strip().split())


class PredictionRecord(BaseModel):
    id: int
    created_at: str
    status: str
    risk_category: str
    probability_score: float
    applicant: dict


app = FastAPI(title="Lumen Credit Risk API", version="2.0.0", description="Production-style loan risk scoring service backed by a serialized Logistic Regression model.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

RATE_LIMIT = 60
rate_events: dict[str, deque[float]] = defaultdict(deque)
rate_lock = Lock()


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if request.url.path == "/api/predict":
        client = request.client.host if request.client else "unknown"
        now = time.time()
        with rate_lock:
            events = rate_events[client]
            while events and events[0] <= now - 60:
                events.popleft()
            if len(events) >= RATE_LIMIT:
                raise HTTPException(status_code=429, detail="Prediction rate limit exceeded")
            events.append(now)
    return await call_next(request)


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute("""CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            applicant_json TEXT NOT NULL, status TEXT NOT NULL, risk_category TEXT NOT NULL,
            probability_score REAL NOT NULL, model_version TEXT NOT NULL)""")
        connection.commit()


def load_artifacts():
    # 1. Prefer lightweight pre-computed model artifacts inside backend/model/
    if MODEL_PATH.exists() and SCALER_PATH.exists() and CATEGORIES_PATH.exists():
        logger.info("Loading pre-computed model artifacts from %s", MODEL_DIR)
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        with open(CATEGORIES_PATH, "r") as f:
            category_values = json.load(f)
        return model, scaler, 255347, "loan_status", category_values

    # 2. Fallback to computing on-the-fly from root dataset if available
    fallback_model = next((ROOT_DIR / name for name in ("loan_default_model.pkl", "Loan_default.pkl") if (ROOT_DIR / name).exists()), None)
    if fallback_model and DATA_PATH.exists():
        logger.info("Falling back to root dataset %s", DATA_PATH)
        data = pd.read_csv(DATA_PATH)
        data.columns = data.columns.str.strip().str.lower().str.replace(" ", "_", regex=False)
        data = data.drop(columns=["loanid"], errors="ignore")
        target = "loan_status" if "loan_status" in data.columns else "default"
        if target not in data.columns:
            raise RuntimeError("Could not find the default target column in the dataset")
        category_values = {}
        for column in data.select_dtypes(include="object").columns:
            categories = sorted(data[column].astype(str).unique())
            category_values[column] = categories
            data[column] = data[column].astype(str).map({value: index for index, value in enumerate(categories)})
        features = data.drop(columns=[target])
        labels = data[target]
        train_features, _, _, _ = train_test_split(features, labels, test_size=0.2, random_state=42)
        return joblib.load(fallback_model), StandardScaler().fit(train_features), len(data), target, category_values

    raise RuntimeError("Model artifacts not found in backend/model/ and root dataset is missing.")


try:
    MODEL, SCALER, ROW_COUNT, TARGET, CATEGORY_VALUES = load_artifacts()
except Exception as error:
    MODEL = SCALER = ROW_COUNT = TARGET = CATEGORY_VALUES = None
    STARTUP_ERROR = str(error)
    logger.exception("Artifact loading failed")
else:
    STARTUP_ERROR = ""
init_db()


def ensure_ready() -> None:
    if STARTUP_ERROR:
        raise HTTPException(status_code=503, detail=STARTUP_ERROR)



def model_input(application: LoanApplication) -> pd.DataFrame:
    values = application.model_dump()
    mapped = {"age": values["Age"], "income": values["Income"], "loan_amount": values["LoanAmount"], "credit_score": values["CreditScore"], "months_employed": values["MonthsEmployed"], "num_credit_lines": values["NumCreditLines"], "interest_rate": values["InterestRate"], "loan_term": values["LoanTerm"], "dti_ratio": values["DTIRatio"], "education": values["Education"], "employment_type": values["EmploymentType"], "marital_status": values["MaritalStatus"], "has_mortgage": values["HasMortgage"], "has_dependents": values["HasDependents"], "loan_purpose": values["LoanPurpose"], "has_cosigner": values["HasCoSigner"]}
    encoded = []
    for feature in FEATURES:
        value = mapped[feature]
        if isinstance(value, str):
            categories = CATEGORY_VALUES.get(feature) or CATEGORY_VALUES.get(feature.replace("_", ""))
            if categories is None:
                raise HTTPException(status_code=422, detail=f"No category mapping configured for {feature}")
            if value not in categories:
                raise HTTPException(status_code=422, detail=f"Unknown value for {feature}: {value}")
            value = categories.index(value)
        encoded.append(value)
    return pd.DataFrame([encoded], columns=FEATURES)


def risk_category(probability: float) -> str:
    return "Low Risk" if probability < 0.18 else "Medium Risk" if probability < 0.35 else "High Risk"


def explanation(application: LoanApplication, probability: float) -> list[str]:
    factors = []
    if application.CreditScore < 580: factors.append("Credit score is below the prime lending range.")
    if application.DTIRatio > 0.45: factors.append("Debt-to-income ratio indicates elevated repayment pressure.")
    if application.LoanAmount / application.Income > 2: factors.append("Requested amount is high relative to annual income.")
    if application.MonthsEmployed < 12: factors.append("Short employment history reduces income stability confidence.")
    if not factors: factors.append("Credit quality, affordability, and employment signals are within the model's lower-risk ranges.")
    return factors[:3]


def save_prediction(application: LoanApplication, status: str, category: str, probability: float) -> int:
    import json
    with sqlite3.connect(DB_PATH) as connection:
        cursor = connection.execute("INSERT INTO predictions (applicant_json, status, risk_category, probability_score, model_version) VALUES (?, ?, ?, ?, ?)", (json.dumps(application.model_dump()), status, category, probability, "logistic-regression-v1"))
        connection.commit()
        return int(cursor.lastrowid)


@app.get("/api/health", tags=["System"])
def health():
    if STARTUP_ERROR:
        raise HTTPException(status_code=503, detail=STARTUP_ERROR)
    return {"status": "ok", "model": MODEL_PATH.name, "database": str(DB_PATH.name), "rows": ROW_COUNT}


@app.get("/api/data", tags=["System"])
def data_summary():
    ensure_ready()
    return {"rows": ROW_COUNT, "features": FEATURES, "default_rate": 0.1161, "model": "Logistic Regression"}


@app.get("/api/analytics", tags=["Analytics"])
def analytics():
    with sqlite3.connect(DB_PATH) as connection:
        total, low, high, approved = connection.execute("SELECT COUNT(*), SUM(risk_category = 'Low Risk'), SUM(risk_category = 'High Risk'), SUM(status = 'Approved') FROM predictions").fetchone()
        recent = connection.execute("SELECT id, created_at, status, risk_category, probability_score FROM predictions ORDER BY id DESC LIMIT 8").fetchall()
    return {"total_predictions": total or 0, "low_risk": low or 0, "high_risk": high or 0, "approval_percentage": round((approved or 0) / total * 100, 1) if total else 0, "recent_predictions": [{"id": row[0], "created_at": row[1], "status": row[2], "risk_category": row[3], "probability_score": row[4]} for row in recent]}


@app.get("/api/predictions", response_model=list[PredictionRecord], tags=["Analytics"])
def prediction_history(limit: int = 25):
    import json
    limit = min(max(limit, 1), 100)
    with sqlite3.connect(DB_PATH) as connection:
        rows = connection.execute("SELECT id, created_at, status, risk_category, probability_score, applicant_json FROM predictions ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return [{"id": row[0], "created_at": row[1], "status": row[2], "risk_category": row[3], "probability_score": row[4], "applicant": json.loads(row[5])} for row in rows]


@app.post("/api/predict", tags=["Scoring"])
def predict(application: LoanApplication):
    ensure_ready()
    features = model_input(application)
    probability = float(MODEL.predict_proba(SCALER.transform(features.to_numpy()))[0][1])
    default_risk = bool(MODEL.predict(SCALER.transform(features.to_numpy()))[0])
    category = risk_category(probability)
    status = "Default Risk" if default_risk else "Approved"
    record_id = save_prediction(application, status, category, probability)
    logger.info("Scored prediction id=%s category=%s probability=%.4f", record_id, category, probability)
    return {"id": record_id, "loan_status": status, "probability_score": round(probability, 4), "risk_category": category, "explanation": explanation(application, probability), "model": "Logistic Regression", "model_version": "logistic-regression-v1"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

