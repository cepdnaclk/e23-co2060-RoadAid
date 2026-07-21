import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { clearAuth, getAuth } from "../auth";
import AppLayout from "../components/AppLayout";

function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

  if (Array.isArray(data)) return data.join(" ");

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value) && value.length) return value.join(" ");
    }
  }

  return fallback;
}

function Badge({ children, tone }) {
  const colors = {
    green: { background: "#dcfce7", color: "#166534" },
    yellow: { background: "#fef3c7", color: "#92400e" },
    red: { background: "#fee2e2", color: "#991b1b" },
    gray: { background: "#f3f4f6", color: "#374151" },
  };
  const style = colors[tone] || colors.gray;

  return (
    <span
      style={{
        ...style,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export default function AdminUsers() {
  const nav = useNavigate();
  const { username, isSuperuser } = getAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [roleFilter, setRoleFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");

  function logout() {
    clearAuth();
    nav("/login");
  }

  async function loadUsers() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (approvalFilter) params.set("approval_status", approvalFilter);
      if (activeFilter) params.set("is_active", activeFilter);
      if (search) params.set("search", search);

      const res = await api.get(`/admin-api/users/?${params.toString()}`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setErr(getApiErrorMessage(error, "Could not load users."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, approvalFilter, activeFilter]);

  async function runAction(promise, successMsg) {
    setErr("");
    setMsg("");
    try {
      await promise;
      setMsg(successMsg);
      await loadUsers();
    } catch (error) {
      setErr(getApiErrorMessage(error, "Action failed."));
    }
  }

  function approve(u) {
    runAction(
      api.post(`/admin-api/users/${u.id}/approve/`),
      `${u.username} approved.`
    );
  }

  function reject(u) {
    runAction(
      api.post(`/admin-api/users/${u.id}/reject/`),
      `${u.username} rejected.`
    );
  }

  function suspend(u) {
    if (!window.confirm(`Suspend ${u.username}? They won't be able to log in.`)) return;
    runAction(
      api.post(`/admin-api/users/${u.id}/suspend/`),
      `${u.username} suspended.`
    );
  }

  function reactivate(u) {
    runAction(
      api.post(`/admin-api/users/${u.id}/reactivate/`),
      `${u.username} reactivated.`
    );
  }

  function removeUser(u) {
    if (
      !window.confirm(
        `Permanently delete mechanic ${u.username}? This cannot be undone.`
      )
    )
      return;

    runAction(
      api.delete(`/admin-api/users/${u.id}/`),
      `${u.username} deleted.`
    );
  }

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Manage users"
      right={
        <div className="mechTopRight">
          <span className="mechUserPill">{username}</span>
          <button className="btn" onClick={() => nav("/admin")}>
            Dashboard
          </button>
          <button className="btn btnDanger" onClick={logout}>
            Logout
          </button>
        </div>
      }
    >
      <div className="mechHero">
        <h1 className="mechHeroTitle">Users</h1>
        <div className="mechHeroSub">Approve mechanics, suspend accounts, or remove one</div>
      </div>

      {err && <div className="alertBox alertError">{err}</div>}
      {msg && <div className="alertBox alertSuccess">{msg}</div>}

      <div className="mechSection" style={{ marginTop: 18 }}>
        <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
          <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="mechanic">Mechanic</option>
          </select>

          <select
            className="input"
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
          >
            <option value="">All approval statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="input"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="">Active + Suspended</option>
            <option value="true">Active only</option>
            <option value="false">Suspended only</option>
          </select>

          <input
            className="input"
            placeholder="Search username / name / email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
          />

          <button className="btn" onClick={loadUsers} disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {users.length === 0 && !loading ? (
          <div className="mechHintBox">No users match these filters.</div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="mechCard">
              <div className="mechCardTop">
                <div>
                  <div className="mechRequestId">
                    #{u.id} - {u.username}
                  </div>
                  <div className="mechRequestTitle">{u.full_name || "(no name set)"}</div>
                  <div className="mechRequestMeta">
                    {u.email || "no email"} - {u.phone || "no phone"}
                  </div>
                </div>

                <div className="row" style={{ gap: 6 }}>
                  <Badge tone="gray">{u.role}</Badge>
                  {u.role === "mechanic" && (
                    <Badge
                      tone={
                        u.approval_status === "approved"
                          ? "green"
                          : u.approval_status === "rejected"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {u.approval_status}
                    </Badge>
                  )}
                  <Badge tone={u.is_active ? "green" : "red"}>
                    {u.is_active ? "active" : "suspended"}
                  </Badge>
                  {u.is_staff && <Badge tone="gray">staff</Badge>}
                </div>
              </div>

              {u.mechanic_profile && (
                <div className="mechGrid">
                  <div className="mechInfoItem">
                    <div className="mechInfoLabel">Skills</div>
                    <div className="mechInfoValue">
                      {u.mechanic_profile.skills.length > 0
                        ? u.mechanic_profile.skills.join(", ")
                        : "none set"}
                    </div>
                  </div>
                  <div className="mechInfoItem">
                    <div className="mechInfoLabel">Vehicle Types</div>
                    <div className="mechInfoValue">
                      {u.mechanic_profile.vehicle_types.length > 0
                        ? u.mechanic_profile.vehicle_types.join(", ")
                        : "any"}
                    </div>
                  </div>
                  <div className="mechInfoItem">
                    <div className="mechInfoLabel">Rating</div>
                    <div className="mechInfoValue">{u.mechanic_profile.rating}</div>
                  </div>
                </div>
              )}

              <div className="mechActions">
                {u.role === "mechanic" && u.approval_status !== "approved" && (
                  <button className="btn btnPrimaryDark" onClick={() => approve(u)}>
                    Approve
                  </button>
                )}
                {u.role === "mechanic" && u.approval_status !== "rejected" && (
                  <button className="btn" onClick={() => reject(u)}>
                    Reject
                  </button>
                )}
                {u.is_active ? (
                  <button className="btn btnDanger" onClick={() => suspend(u)}>
                    Suspend
                  </button>
                ) : (
                  <button className="btn" onClick={() => reactivate(u)}>
                    Reactivate
                  </button>
                )}
                {isSuperuser && u.role === "mechanic" && (
                  <button className="btn btnDanger" onClick={() => removeUser(u)}>
                    Delete Permanently
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mechHintBox" style={{ marginTop: 16 }}>
        Customer accounts can only be suspended, not deleted - deleting one would also erase
        their entire request history. Mechanics can be deleted (superuser only) since their
        past jobs stay on record either way.
      </div>
    </AppLayout>
  );
}