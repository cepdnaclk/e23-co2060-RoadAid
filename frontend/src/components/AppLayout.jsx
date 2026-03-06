export default function AppLayout({ title, subtitle, right, children }) {
  return (
    <div className="page">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <div className="logo" />
            <div className="brandText">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>
          {right}
        </div>

        <div className="card">
          <div className="cardHeader">
            <h2>{title}</h2>
            <span className="pill">{subtitle}</span>
          </div>
          <div className="cardBody">{children}</div>
        </div>
      </div>
    </div>
  );
}