export default function About() {
  return (
    <div className="page about-page">
      <header className="page-head">
        <p className="eyebrow">Model card</p>
        <h1>About this prediction system</h1>
        <p className="lede">
          Lumen Credit is the product layer on top of the SEM-5 loan default notebook. The UI is
          complete first; FastAPI will load Loan_default.pkl and score live requests next.
        </p>
      </header>

      <section className="about-grid">
        <article className="card">
          <h3>Dataset</h3>
          <p>
            <code>Loan_default.csv</code> contains 255,347 labeled applications with borrower
            demographics, credit profile, loan terms, and a binary Default target.
          </p>
        </article>
        <article className="card">
          <h3>Preprocessing</h3>
          <p>
            LoanID is dropped. Categorical columns are label-encoded. Numeric fields are scaled
            with StandardScaler before logistic regression, matching the notebook pipeline.
          </p>
        </article>
        <article className="card">
          <h3>Estimator</h3>
          <p>
            sklearn LogisticRegression (max_iter=1000), 80/20 train-test split, random_state=42.
            Reported test accuracy is 88.6%. The pickle file is the production artifact.
          </p>
        </article>
        <article className="card">
          <h3>Limitations</h3>
          <p>
            Defaults are uncommon, so overall accuracy is optimistic. Recall on the default class
            is low in the current report. Treat scores as decision support, not a final credit
            policy.
          </p>
        </article>
      </section>

      <section className="pipeline">
        <h2>Intended architecture</h2>
        <ol>
          <li>
            <strong>React workspace</strong>
            <span>This site — underwriting form, insights, and result presentation.</span>
          </li>
          <li>
            <strong>FastAPI service</strong>
            <span>Validate payload, encode features, scale, and call the pickle model.</span>
          </li>
          <li>
            <strong>Loan_default.pkl</strong>
            <span>Serialized logistic regression trained in Loan_default.ipynb.</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
