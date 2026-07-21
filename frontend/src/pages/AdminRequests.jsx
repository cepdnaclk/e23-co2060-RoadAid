import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import AppLayout from "../components/AppLayout";
import { PROBLEM_OPTIONS, VEHICLE_OPTIONS } from "../utils/problemTypes";

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data)) return data.join(" ");
  return fallback;
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminRequests() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [problemFilter, setProblemFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [search, setSearch] = useState("");

  function logout() {
    clearAuth();
    nav("/login");
  }

  async function loadRequests() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (problemFilter) params.set("problem_type", problemFilter);
      if (vehicleFilter) params.set("vehicle_type", vehicleFilter);
      if (search) params.set("search", search);

      const res = await api.get(`/admin-api/requests/?${params.toString()}`);
      setRequestsList(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not load requests."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, problemFilter, vehicleFilter]);

  async function forceCancel(r) {
    if (!window.confirm(`Force-cancel request #${r.id}?`)) return;

    setErr("");
    setMsg("");
    try {
      await api.post(`/admin-api/requests/${r.id}/force-cancel/`);
      setMsg(`Request #${r.id} cancelled.`);
      await loadRequests();
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not cancel this request."));
    }
  }

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Request oversight"
      right={
        <div className="mechTopRight">
          <span className="mechUserPill">{username}</span>
          <button className="btn" onClick={() => nav("/admin")}>
            Dashboard
          </button>
          <button className="btn" onClick={() => nav("/admin/users")}>
            Users
          </button>
          <button className="btn btnDanger" onClick={logout}>
            Logout
          </button>
        </div>
      }
    >
      <div className="mechHero">
        <h1 className="mechHeroTitle">Service Requests</h1>
        <div className="mechHeroSub">Review all requests across the platform</div>
      </div>

      {err && <div className="alertBox alertError">{err}</div>}
      {msg && <div className="alertBox alertSuccess">{msg}</div>}

      <div className="mechSection" style={{ marginTop: 18 }}>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={problemFilter}
            onChange={(e) => setProblemFilter(e.target.value)}
          >
            <option value="">All problem types</option>
            {PROBLEM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
          >
            <option value="">All vehicle types</option>
            {VEHICLE_OPTIONS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Search by customer / mechanic username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadRequests()}
          />

          <button className="btn" onClick={loadRequests} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {requestsList.length === 0 && !loading ? (
          <div className="mechHintBox">No requests match these filters.</div>
        ) : (
          requestsList.map((r) => (
            <div key={r.id} className="mechCard">
              <div className="mechCardTop">
                <div>
                  <div className="mechRequestId">Request #{r.id}</div>
                  <div className="mechRequestTitle">
                    {r.problem_type_display || r.problem_type}
                  </div>
                  <div className="mechRequestMeta">
                    Customer: {r.customer_username || "-"} - Mechanic:{" "}
                    {r.mechanic_username || "unassigned"}
                  </div>
                </div>
                <span className={`mechBadge ${r.status}`}>{r.status}</span>
              </div>

              <div className="mechGrid">
                <div className="mechInfoItem">
                  <div className="mechInfoLabel">Vehicle Type</div>
                  <div className="mechInfoValue">{r.vehicle_type_display || r.vehicle_type}</div>
                </div>
                <div className="mechInfoItem">
                  <div className="mechInfoLabel">Created</div>
                  <div className="mechInfoValue">{formatDate(r.created_at)}</div>
                </div>
                <div className="mechInfoItem">
                  <div className="mechInfoLabel">Rating</div>
                  <div className="mechInfoValue">{r.rating || "not rated"}</div>
                </div>
              </div>

              {!["completed", "cancelled", "rejected"].includes(r.status) && (
                <div className="mechActions">
                  <button className="btn btnDanger" onClick={() => forceCancel(r)}>
                    Force Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}