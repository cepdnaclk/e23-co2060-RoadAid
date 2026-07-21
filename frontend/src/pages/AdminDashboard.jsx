import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import AppLayout from "../components/AppLayout";

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
  return fallback;
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`mechCard`} style={{ minWidth: 180 }}>
      <div className="mechInfoLabel">{label}</div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginTop: 6,
          color: tone === "warn" ? "#b45309" : tone === "danger" ? "#b91c1c" : "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  function logout() {
    clearAuth();
    nav("/login");
  }

  async function loadStats() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/admin-api/stats/");
      setStats(res.data);
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not load dashboard stats."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Admin dashboard"
      right={
        <div className="mechTopRight">
          <span className="mechUserPill">{username}</span>
          <button className="btn" onClick={() => nav("/admin/users")}>
            Manage Users
          </button>
          <button className="btn" onClick={() => nav("/admin/requests")}>
            Requests
          </button>
          <button className="btn btnDanger" onClick={logout}>
            Logout
          </button>
        </div>
      }
    >
      <div className="mechHero">
        <h1 className="mechHeroTitle">Overview</h1>
        <div className="mechHeroSub">Platform activity at a glance</div>
      </div>

      {err && <div className="alertBox alertError">{err}</div>}

      {loading ? (
        <div className="mechHintBox" style={{ marginTop: 18 }}>
          Loading stats...
        </div>
      ) : (
        stats && (
          <div className="row" style={{ flexWrap: "wrap", gap: 14, marginTop: 18 }}>
            <StatCard
              label="Pending Mechanic Approvals"
              value={stats.pending_mechanics}
              tone={stats.pending_mechanics > 0 ? "warn" : undefined}
            />
            <StatCard label="Approved Mechanics" value={stats.approved_mechanics} />
            <StatCard label="Total Customers" value={stats.total_customers} />
            <StatCard label="Active Requests" value={stats.active_requests} />
            <StatCard label="Requests Today" value={stats.requests_today} />
            <StatCard
              label="Suspended Accounts"
              value={stats.suspended_users}
              tone={stats.suspended_users > 0 ? "danger" : undefined}
            />
          </div>
        )
      )}

      <div className="mechHintBox" style={{ marginTop: 18 }}>
        Head to <b>Manage Users</b> to approve or reject mechanic sign-ups, suspend accounts,
        or remove a mechanic. Use <b>Requests</b> to review or force-cancel stuck service
        requests.
      </div>
    </AppLayout>
  );
}