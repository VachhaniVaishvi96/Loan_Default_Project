import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/predict", label: "Risk Assessment" },
  { to: "/insights", label: "Portfolio Insights" },
  { to: "/about", label: "About the Model" },
  { to: "/models", label: "Model Lab" },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <div className="bg-grid" aria-hidden="true" />
      <header className="nav">
        <NavLink to="/" className="brand">
          <span className="brand-mark">L</span>
          <span>
            <strong>Lumen Credit</strong>
            <small>Loan Default Intelligence</small>
          </span>
        </NavLink>
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/predict" className="nav-cta">
          Run assessment
        </NavLink>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div>
          <strong>Lumen Credit</strong>
          <p>Academic ML prototype for loan default prediction. Not a regulated credit decisioning system.</p>
        </div>
        <div className="footer-meta">
          <span>255,347 historical applications</span>
          <span>Logistic Regression · 88.6% accuracy</span>
          <span>SEM-5 Machine Learning Project</span>
        </div>
      </footer>
    </div>
  );
}
