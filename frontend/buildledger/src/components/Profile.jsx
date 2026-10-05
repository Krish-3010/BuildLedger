import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../utils/Header";
import { useAuth } from "../utils/AuthContext.jsx";
import { fetchSites, fetchTransactions } from "../utils/api.js";
import "./Profile.css";


function shortRupee(val) {
  const n = Number(val) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}


function BarChart({ bars }) {
  if (!bars || bars.length === 0) return <p className="no-data-msg">No data available.</p>;

  const VW = 600;        
  const VH = 200;        
  const BOTTOM = 24;     
  const TOTAL_H = VH + BOTTOM;
  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const gap = 6;
  const barW = (VW - gap * (bars.length + 1)) / bars.length;

  return (
    <svg
      viewBox={`0 0 ${VW} ${TOTAL_H}`}
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      {[0.25, 0.5, 0.75, 1].map((frac) => {
        const y = VH - frac * VH;
        return (
          <g key={frac}>
            <line x1={0} y1={y} x2={VW} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={4} y={y - 3} fontSize="11" fill="rgba(255,255,255,0.3)">
              {shortRupee(frac * maxVal)}
            </text>
          </g>
        );
      })}

      {bars.map((bar, i) => {
        const barH = Math.max((bar.value / maxVal) * VH, 0);
        const x = gap + i * (barW + gap);
        const y = VH - barH;
        const color = bar.color || "#f6ce1e";

        return (
          <g key={i}>
            {/* Bar */}
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.88} />

            {barH > 16 && (
              <text
                x={x + barW / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.85)"
              >
                {shortRupee(bar.value)}
              </text>
            )}

            {/* X-axis label */}
            {bar.name && (
              <text
                x={x + barW / 2}
                y={TOTAL_H - 4}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(255,255,255,0.5)"
              >
                {bar.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}


function LineChart({ data, color = "#34d399" }) {
  if (!data || data.length < 2) return <p className="no-data-msg">Add at least 2 transactions to see the trend.</p>;

  const VW = 600;
  const VH = 200;
  const BOTTOM = 24;
  const TOTAL_H = VH + BOTTOM;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const PAD = 20; // left padding for value labels

  const pts = data.map((d, i) => ({
    x: PAD + (i / (data.length - 1)) * (VW - PAD),
    y: VH - Math.max((d.value / maxVal) * (VH - 20), 0) - 10,
    ...d,
  }));

  const polylinePts = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPts =
    `${pts[0].x},${VH} ` + pts.map((p) => `${p.x},${p.y}`).join(" ") + ` ${pts[pts.length - 1].x},${VH}`;

  return (
    <svg
      viewBox={`0 0 ${VW} ${TOTAL_H}`}
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      {[0.25, 0.5, 0.75, 1].map((frac) => {
        const y = VH - (frac * (VH - 20)) - 10;
        return (
          <g key={frac}>
            <line x1={PAD} y1={y} x2={VW} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={0} y={y + 4} fontSize="11" fill="rgba(255,255,255,0.3)">
              {shortRupee(frac * maxVal)}
            </text>
          </g>
        );
      })}

      <polygon points={areaPts} fill={color} opacity={0.1} />

      <polyline
        points={polylinePts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={color} />
          <circle cx={p.x} cy={p.y} r="3" fill="#0a1628" />

          <text x={p.x} y={TOTAL_H - 4} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">
            {p.name}
          </text>

          {p.value > 0 && (
            <text
              x={p.x}
              y={p.y - 9}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(255,255,255,0.75)"
            >
              {shortRupee(p.value)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}


function Profile() {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [sites, setSites]         = useState([]);
  const [transactions, setTx]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [s, t] = await Promise.all([fetchSites(), fetchTransactions()]);
        setSites(Array.isArray(s) ? s : []);
        setTx(Array.isArray(t) ? t : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => { logoutUser(); navigate("/login"); };

  const totalSites        = sites.length;
  const activeSites       = sites.filter((s) => s.active).length;
  const totalBudget       = sites.reduce((a, s) => a + Number(s.budget || 0), 0);

  const isSpentTx = (tx) =>
    tx.type ? tx.type.toUpperCase() === "SPENT" : Number(tx.amount) < 0;

  const totalSpent    = transactions.reduce((a, t) =>  isSpentTx(t) ? a + Math.abs(Number(t.amount || 0)) : a, 0);
  const totalReceived = transactions.reduce((a, t) => !isSpentTx(t) ? a + Math.abs(Number(t.amount || 0)) : a, 0);
  const netBalance    = totalReceived - totalSpent;
  const budgetPct     = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  let healthStatus    = "EXCELLENT";
  let healthClass     = "health-excellent";
  let healthDesc      = "Site finances are well-balanced and within budget limits.";
  if (totalSpent > totalReceived && totalReceived > 0) {
    healthStatus = "DEFICIT WARNING";  healthClass = "health-warning";
    healthDesc   = "Total expenses exceed total funding. Additional funds required.";
  } else if (budgetPct > 90) {
    healthStatus = "HIGH UTILIZATION"; healthClass = "health-caution";
    healthDesc   = "You have spent over 90% of your allocated total budget.";
  }

  const siteBarData = sites.slice(0, 6).flatMap((s) => [
    { name: (s.name || "Site").substring(0, 6), value: Number(s.curSpent    || 0), color: "#f87171" },
    { name: "",                                  value: Number(s.curReceived || 0), color: "#34d399" },
  ]);

  const recentTx = [...transactions].slice(-10);
  let running = 0;
  const balanceLine = recentTx.map((tx, i) => {
    running += isSpentTx(tx)
      ? -Math.abs(Number(tx.amount || 0))
      :  Math.abs(Number(tx.amount || 0));
    return { name: `T${i + 1}`, value: Math.max(running, 0) };
  });

  const txBars = [...transactions].slice(-8).map((tx, i) => ({
    name:  `T${i + 1}`,
    value: Math.abs(Number(tx.amount || 0)),
    color: isSpentTx(tx) ? "#f87171" : "#34d399",
  }));

  // Chart 4: Budget vs Spent per site
  const budgetBars = sites.slice(0, 6).flatMap((s) => [
    { name: (s.name || "Site").substring(0, 5), value: Number(s.budget   || 0), color: "#f6ce1e" },
    { name: "",                                  value: Number(s.curSpent || 0), color: "#f87171" },
  ]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-container">

          {/* User card */}
          <div className="user-profile-card glass-card">
            <div className="user-info-wrapper">
              <div className="avatar-circle">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="user-details">
                <p className="profile-subtitle">BUILDLEDGER ACCOUNT</p>
                <h2>{user?.username || "Builder"}</h2>
                <div className="user-tags">
                  <span className="user-role-badge">🏗️ Site Manager</span>
                  <span className="user-auth-badge">Active</span>
                </div>
              </div>
            </div>
            <button className="profile-logout-btn" onClick={handleLogout}>Logout</button>
          </div>

          {loading ? (
            <div className="profile-status-card">
              <div className="spinner" /><p>Loading analytics...</p>
            </div>
          ) : error ? (
            <div className="profile-status-card error-card">
              <p className="error-msg">⚠️ {error}</p>
            </div>
          ) : (
            <>
              {/* Diagnosis */}
              <div className={`diagnosis-banner glass-card ${healthClass}`}>
                <div className="diagnosis-icon">📊</div>
                <div>
                  <div className="diagnosis-title-row">
                    <h3>Financial Diagnosis</h3>
                    <span className="status-pill">{healthStatus}</span>
                  </div>
                  <p>{healthDesc}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="metrics-grid">
                {[
                  { label: "TOTAL SITES",    val: totalSites,    sub: `${activeSites} Active`,    cls: "" },
                  { label: "TOTAL BUDGET",   val: `₹${totalBudget.toLocaleString("en-IN")}`,   cls: "text-budget" },
                  { label: "TOTAL RECEIVED", val: `₹${totalReceived.toLocaleString("en-IN")}`, cls: "text-received" },
                  { label: "TOTAL SPENT",    val: `₹${totalSpent.toLocaleString("en-IN")}`,    cls: "text-spent" },
                  {
                    label: "NET BALANCE",
                    val: `${netBalance >= 0 ? "+" : "−"}₹${Math.abs(netBalance).toLocaleString("en-IN")}`,
                    cls: netBalance >= 0 ? "text-received" : "text-spent",
                  },
                ].map(({ label, val, sub, cls }) => (
                  <div key={label} className="metric-card glass-card">
                    <span className="metric-label">{label}</span>
                    <div className="metric-value-row">
                      <span className={`metric-value ${cls}`}>{val}</span>
                      {sub && <span className="metric-sub">{sub}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts 2×2 grid */}
              <div className="charts-grid">

                <div className="chart-card glass-card">
                  <div className="chart-header">
                    <h3>Site-wise Cashflow</h3>
                    <span className="chart-tag">Bar · Spent vs Received</span>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#f87171" }}/><span>Spent</span></div>
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#34d399" }}/><span>Received</span></div>
                  </div>
                  <div className="chart-svg-wrap"><BarChart bars={siteBarData} /></div>
                </div>

                <div className="chart-card glass-card">
                  <div className="chart-header">
                    <h3>Running Balance</h3>
                    <span className="chart-tag">Line · Cumulative</span>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#34d399" }}/><span>Net Balance over time</span></div>
                  </div>
                  <div className="chart-svg-wrap"><LineChart data={balanceLine} color="#34d399" /></div>
                </div>

                <div className="chart-card glass-card">
                  <div className="chart-header">
                    <h3>Recent Transactions</h3>
                    <span className="chart-tag">Bar · Last 8</span>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#f87171" }}/><span>Spent</span></div>
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#34d399" }}/><span>Received</span></div>
                  </div>
                  <div className="chart-svg-wrap"><BarChart bars={txBars} /></div>
                </div>

                <div className="chart-card glass-card">
                  <div className="chart-header">
                    <h3>Budget vs Spent</h3>
                    <span className="chart-tag">Bar · Per Site</span>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#f6ce1e" }}/><span>Budget</span></div>
                    <div className="legend-item"><span className="legend-dot" style={{ background:"#f87171" }}/><span>Spent</span></div>
                  </div>
                  <div className="chart-svg-wrap"><BarChart bars={budgetBars} /></div>
                </div>

              </div>

              {/* Quick actions */}
              <div className="profile-quick-actions">
                <Link to="/sites" className="quick-action-link">
                  <button className="quick-action-btn">🏢 Manage Sites →</button>
                </Link>
                <Link to="/transactions" className="quick-action-link">
                  <button className="quick-action-btn">💸 View All Transactions →</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
