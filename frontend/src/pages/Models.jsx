import "../models.css";

const models = [
  { name: "Logistic Regression", family: "Linear classifier", accuracy: "88.59%", f1: "5.91%", precision: "62.03%", status: "Production", note: "Current scoring artifact" },
  { name: "Decision Tree", family: "Tree-based classifier", accuracy: "80.25%", f1: "21.29%", precision: "19.72%", status: "Evaluated", note: "Higher default recall in notebook" },
  { name: "K-NN", family: "Distance-based classifier", accuracy: "87.57%", f1: "11.64%", precision: "32.53%", status: "Evaluated", note: "Standardized features, k = 5" },
  { name: "Naive Bayes", family: "Probabilistic classifier", accuracy: "88.54%", f1: "3.08%", precision: "66.43%", status: "Evaluated", note: "GaussianNB baseline" },
];

export default function Models() {
  return (
    <div className="page models-page">
      <header className="page-head">
        <p className="eyebrow">Model governance / Benchmark</p>
        <h1>Model performance lab</h1>
        <p className="lede">
          Compare the classifiers evaluated in the Loan Default notebook before choosing a scoring
          artifact. Metrics are reported on the same held-out test split and focus on the default class.
        </p>
      </header>

      <section className="model-summary">
        <div className="model-summary-copy">
          <p className="panel-kicker">Selected for serving</p>
          <h2>Logistic Regression</h2>
          <p>Stable overall accuracy, fast inference, and an interpretable coefficient-based baseline.</p>
        </div>
        <div className="model-summary-metrics">
          <div><strong>88.59%</strong><span>Accuracy</span></div>
          <div><strong>62.03%</strong><span>Precision</span></div>
          <div><strong>5.91%</strong><span>F1 score</span></div>
        </div>
      </section>

      <section className="model-table-card card">
        <div className="table-heading">
          <div>
            <h2>Classifier benchmark</h2>
            <p className="card-sub">Test split · random_state 42 · 20% holdout</p>
          </div>
          <span className="evaluation-badge">Notebook evaluation</span>
        </div>
        <div className="table-scroll">
          <table className="model-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Accuracy</th>
                <th>F1 score</th>
                <th>Precision</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr className={model.status === "Production" ? "selected-model" : ""} key={model.name}>
                  <td><strong>{model.name}</strong><small>{model.family}</small></td>
                  <td><span className="metric-value">{model.accuracy}</span></td>
                  <td><span className="metric-value">{model.f1}</span></td>
                  <td><span className="metric-value">{model.precision}</span></td>
                  <td><span className={`model-status ${model.status === "Production" ? "production" : "evaluated"}`}>{model.status}</span><small>{model.note}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="model-notes">
        <article className="card"><p className="eyebrow">Read the metrics correctly</p><h3>Accuracy is not the full story</h3><p>The dataset is imbalanced. A high accuracy score can coexist with weak default-class detection, so F1 and precision are shown beside accuracy for a more honest comparison.</p></article>
        <article className="card"><p className="eyebrow">Governance note</p><h3>Production choice remains reviewable</h3><p>The saved Logistic Regression artifact powers live scoring today. These benchmark results remain visible so future threshold or model changes can be discussed with evidence.</p></article>
      </section>
    </div>
  );
}
