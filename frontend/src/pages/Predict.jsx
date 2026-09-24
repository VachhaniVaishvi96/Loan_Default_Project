import { useState } from "react";
import { API_BASE_URL } from "../config.js";
import {
  EDUCATION,
  EMPLOYMENT,
  emptyForm,
  MARITAL,
  PURPOSE,
  sampleProfiles,
  TERMS,
  YES_NO,
  getRandomLowRiskForm,
  getRandomHighRiskForm,
} from "../data.js";

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Select({ value, values, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {values.map((item) => (
        <option key={item}>{item}</option>
      ))}
    </select>
  );
}

export default function Predict() {
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const update = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }));

  const handleRandomLowRisk = () => {
    setForm(getRandomLowRiskForm());
    setResult(null);
    setError("");
  };

  const handleRandomHighRisk = () => {
    setForm(getRandomHighRiskForm());
    setResult(null);
    setError("");
  };

  async function onSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const payload = {
      Age: Number(form.age),
      Income: Number(form.income),
      LoanAmount: Number(form.loanAmount),
      CreditScore: Number(form.creditScore),
      MonthsEmployed: Number(form.monthsEmployed),
      NumCreditLines: Number(form.numCreditLines),
      InterestRate: Number(form.interestRate),
      LoanTerm: Number(form.loanTerm),
      DTIRatio: Number(form.dtiRatio),
      Education: form.education,
      EmploymentType: form.employmentType,
      MaritalStatus: form.maritalStatus,
      HasMortgage: form.hasMortgage,
      HasDependents: form.hasDependents,
      LoanPurpose: form.loanPurpose,
      HasCoSigner: form.hasCoSigner,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.text();
      let data = {};
      try {
        data = body ? JSON.parse(body) : {};
      } catch {
        throw new Error(
          `API returned invalid JSON (HTTP ${response.status}). Check that the FastAPI backend is running.`,
        );
      }
      if (!response.ok)
        throw new Error(
          data.detail || `API request failed (HTTP ${response.status})`,
        );
      setResult(data);
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Cannot reach FastAPI. Start the backend with: python -m uvicorn backend.main:app --reload --port 8000"
          : requestError.message,
      );
    } finally {
      setStatus("idle");
    }
  }
  const probability = result?.probability_score || 0;
  const bandClass = result?.risk_category?.split(" ")[0].toLowerCase() || "low";
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Risk operations / New assessment</p>
        <h1>Assess an application</h1>
        <p className="lede">
          Enter the applicant profile used by the production model. Validation
          runs before the request reaches FastAPI, and every completed score is
          retained in the audit history.
        </p>
      </header>
      <div className="predict-layout">
        <form className="form-card" onSubmit={onSubmit}>
          <div className="form-toolbar">
            <h2>Applicant and facility</h2>
            <div className="chips">
              <button
                className="chip chip-low-risk"
                type="button"
                onClick={handleRandomLowRisk}
                title="Fill form with random low-risk data"
              >
                🎲 Random Low Risk
              </button>
              <button
                className="chip chip-high-risk"
                type="button"
                onClick={handleRandomHighRisk}
                title="Fill form with random high-risk data"
              >
                🎲 Random High Risk
              </button>
              {sampleProfiles.map((profile) => (
                <button
                  className="chip"
                  type="button"
                  key={profile.name}
                  onClick={() => {
                    setForm(profile.form);
                    setResult(null);
                    setError("");
                  }}
                >
                  {profile.name}
                </button>
              ))}
            </div>
          </div>
          <div className="form-grid">
            <Field label="Age">
              <input
                required
                type="number"
                min="18"
                max="100"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
              />
            </Field>
            <Field label="Annual income">
              <input
                required
                type="number"
                min="1"
                value={form.income}
                onChange={(e) => update("income", e.target.value)}
              />
            </Field>
            <Field label="Loan amount">
              <input
                required
                type="number"
                min="1"
                value={form.loanAmount}
                onChange={(e) => update("loanAmount", e.target.value)}
              />
            </Field>
            <Field label="Credit score">
              <input
                required
                type="number"
                min="300"
                max="850"
                value={form.creditScore}
                onChange={(e) => update("creditScore", e.target.value)}
              />
            </Field>
            <Field label="Months employed">
              <input
                required
                type="number"
                min="0"
                value={form.monthsEmployed}
                onChange={(e) => update("monthsEmployed", e.target.value)}
              />
            </Field>
            <Field label="Credit lines">
              <input
                required
                type="number"
                min="0"
                max="100"
                value={form.numCreditLines}
                onChange={(e) => update("numCreditLines", e.target.value)}
              />
            </Field>
            <Field label="Interest rate (%)">
              <input
                required
                type="number"
                step=".01"
                min="0"
                max="100"
                value={form.interestRate}
                onChange={(e) => update("interestRate", e.target.value)}
              />
            </Field>
            <Field label="Loan term">
              <Select
                value={`${form.loanTerm} months`}
                values={TERMS.map((term) => `${term} months`)}
                onChange={(value) =>
                  update("loanTerm", Number(value.split(" ")[0]))
                }
              />
            </Field>
            <Field label="DTI ratio (0 to 1)">
              <input
                required
                type="number"
                step=".01"
                min="0"
                max="1"
                value={form.dtiRatio}
                onChange={(e) => update("dtiRatio", e.target.value)}
              />
            </Field>
            <Field label="Education">
              <Select
                value={form.education}
                values={EDUCATION}
                onChange={(value) => update("education", value)}
              />
            </Field>
            <Field label="Employment type">
              <Select
                value={form.employmentType}
                values={EMPLOYMENT}
                onChange={(value) => update("employmentType", value)}
              />
            </Field>
            <Field label="Marital status">
              <Select
                value={form.maritalStatus}
                values={MARITAL}
                onChange={(value) => update("maritalStatus", value)}
              />
            </Field>
            <Field label="Home ownership">
              <Select
                value={form.hasMortgage}
                values={YES_NO}
                onChange={(value) => update("hasMortgage", value)}
              />
            </Field>
            <Field label="Dependents">
              <Select
                value={form.hasDependents}
                values={YES_NO}
                onChange={(value) => update("hasDependents", value)}
              />
            </Field>
            <Field label="Loan intent">
              <Select
                value={form.loanPurpose}
                values={PURPOSE}
                onChange={(value) => update("loanPurpose", value)}
              />
            </Field>
            <Field label="Co-signer">
              <Select
                value={form.hasCoSigner}
                values={YES_NO}
                onChange={(value) => update("hasCoSigner", value)}
              />
            </Field>
          </div>
          <div className="form-actions">
            <button
              className="btn primary"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" && <i className="loading" />}
              {status === "loading"
                ? "Scoring application"
                : "Run risk assessment"}
            </button>
            <button
              className="btn btn-low-risk"
              type="button"
              onClick={handleRandomLowRisk}
            >
              🟢 Fill Random Low Risk
            </button>
            <button
              className="btn btn-high-risk"
              type="button"
              onClick={handleRandomHighRisk}
            >
              🔴 Fill Random High Risk
            </button>
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setResult(null);
                setError("");
              }}
            >
              Reset
            </button>
          </div>
          {error && (
            <p className="form-note" role="alert">
              {error}
            </p>
          )}
        </form>
        <aside className={`result-card band-${bandClass}`}>
          <p className="panel-kicker">Decision intelligence</p>
          <div className="gauge">
            <strong>{Math.round(probability * 100)}%</strong>
            <span>probability of default</span>
          </div>
          <div className="risk-meter">
            <div
              className="risk-meter-fill"
              style={{ width: `${Math.max(4, probability * 100)}%` }}
            />
          </div>
          <h2>{result?.loan_status || "Awaiting assessment"}</h2>
          <p className="card-sub">
            {result?.risk_category ||
              "Complete the form to generate a model-backed result."}
          </p>
          {result && (
            <>
              <ul className="result-list">
                <li>
                  <span>Model version</span>
                  <b>{result.model_version}</b>
                </li>
                <li>
                  <span>Assessment ID</span>
                  <b>#{result.id}</b>
                </li>
              </ul>
              <h3>Why this score</h3>
              <ul className="explanations">
                {result.explanation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
