const defaultRates = [
  { name: "Unemployed", rate: 14.8 },
  { name: "Part-time", rate: 12.4 },
  { name: "Self-employed", rate: 11.1 },
  { name: "Full-time", rate: 8.9 },
];

const purposes = [
  { name: "Auto", share: 21 },
  { name: "Business", share: 20 },
  { name: "Education", share: 20 },
  { name: "Home", share: 20 },
  { name: "Other", share: 19 },
];

const features = [
  { name: "CreditScore", role: "Primary quality signal. Lower scores lift default odds." },
  { name: "DTIRatio", role: "Debt burden versus income. High DTI is a stress marker." },
  { name: "InterestRate", role: "Price of risk already assigned by the lender." },
  { name: "Income / LoanAmount", role: "Capacity to service the requested facility." },
  { name: "MonthsEmployed", role: "Income stability. Short tenure raises uncertainty." },
  { name: "EmploymentType", role: "Unemployed and part-time cohorts default more often." },
];

export default function Insights() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Portfolio intelligence</p>
        <h1>What the historical book is telling us</h1>
        <p className="lede">
          Insights below are aligned with Loan_default.csv (255,347 rows) and the exploratory
          analysis in Loan_default.ipynb — enough context for a demo website without waiting on
          the API.
        </p>
      </header>

      <section className="insight-grid">
        <article className="card wide">
          <h3>Default rate by employment type</h3>
          <p className="card-sub">Relative risk pattern used in the product narrative</p>
          <div className="bars">
            {defaultRates.map((row) => (
              <div key={row.name} className="bar-row">
                <span>{row.name}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(row.rate / 16) * 100}%` }} />
                </div>
                <b>{row.rate}%</b>
              </div>
            ))}
          </div>
        </article>

        <article className="card">
          <h3>Loan purpose mix</h3>
          <p className="card-sub">Nearly even product mix in the CSV</p>
          <ul className="mix">
            {purposes.map((row) => (
              <li key={row.name}>
                <span>{row.name}</span>
                <div>
                  <i style={{ width: `${row.share * 4}%` }} />
                </div>
                <b>{row.share}%</b>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="feature-table">
        <h2>Features the model actually uses</h2>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {features.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
