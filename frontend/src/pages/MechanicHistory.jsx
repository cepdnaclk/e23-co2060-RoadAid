import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { getAuth } from "../auth";
import AppLayout from "../components/AppLayout";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function getApiErrorMessage(err, fallback) {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;

  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors.join(" ");
  }

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value) && value.length) return value.join(" ");
    }
  }

  return fallback;
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  let cls = "mechBadge mechBadgeSmall";
  if (s === "pending") cls += " pending";
  else if (s === "accepted") cls += " accepted";
  else if (s === "completed") cls += " completed";

  return <span className={cls}>{status || "Unknown"}</span>;
}

function InfoItem({ label, value }) {
  return (
    <div className="mechInfoItem mechInfoItemSmall">
      <div className="mechInfoLabel mechInfoLabelSmall">{label}</div>
      <div className="mechInfoValue mechInfoValueSmall">{value || "-"}</div>
    </div>
  );
}

export default function MechanicHistory() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  async function loadHistory() {
    setLoading(true);
    setPageError("");
    setPageMessage("");

    try {
      const res = await api.get("/requests/me/history/");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setHistory([]);
      setPageError(getApiErrorMessage(err, "Could not load mechanic history."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <AppLayout
      title="RoadAid"
      subtitle="Mechanic history"
      right={
        <div className="mechTopRight">
          <span className="mechUserPill">{username}</span>
          <button className="btn" onClick={() => nav("/mechanic")}>
            Back to Dashboard
          </button>
        </div>
      }
    >
      <div className="mechHero mechHeroCompact">
        <h1 className="mechHeroTitle mechHeroTitleSmall">Service History</h1>
        <div className="mechHeroSub mechHeroSubSmall">
          View your completed, cancelled, or rejected jobs
        </div>
      </div>

      {pageError && <div className="alertBox alertError">{pageError}</div>}
      {pageMessage && <div className="alertBox alertSuccess">{pageMessage}</div>}

      <div className="mechSection mechSectionCompact" style={{ marginTop: 18 }}>
        <div className="mechSectionHeader">
          <div>
            <div className="mechSectionTitle mechSectionTitleSmall">My Job History</div>
            <div className="mechSectionSub mechSectionSubSmall">
              Previous requests assigned to you
            </div>
          </div>

          <button className="btn" onClick={loadHistory} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="hint">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="mechEmpty">
            <div className="mechEmptyIcon">📋</div>
            <div className="mechEmptyTitle">No history yet</div>
            <div className="mechEmptyText">
              Completed, cancelled, or rejected jobs will appear here.
            </div>
          </div>
        ) : (
          <div>
            {history.map((item) => {
              const ratingText =
                item.rating !== null && item.rating !== undefined
                  ? `${item.rating} / 5`
                  : "Not rated";

              return (
                <div key={item.id} className="mechCard mechCardCompact">
                  <div className="mechCardTop">
                    <div>
                      <div className="mechRequestId mechRequestIdSmall">Request #{item.id}</div>
                      <div className="mechRequestTitle mechRequestTitleSmall">
                        {item.problem_type_display || item.problem_type || "Service Request"}
                      </div>

                      {item.custom_problem && (
                        <div className="mechRequestMeta mechRequestMetaSmall">
                          Custom problem: {item.custom_problem}
                        </div>
                      )}

                      {item.description && (
                        <div className="mechRequestMeta mechRequestMetaSmall">
                          Description: {item.description}
                        </div>
                      )}

                      {item.customer_username && (
                        <div className="mechRequestMeta mechRequestMetaSmall">
                          Customer: {item.customer_username}
                        </div>
                      )}
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mechGrid">
                    <InfoItem
                      label="Vehicle Type"
                      value={item.vehicle_type_display || item.vehicle_type || "-"}
                    />
                    <InfoItem label="Created" value={formatDate(item.created_at)} />
                    <InfoItem label="Rating" value={ratingText} />
                    <InfoItem label="Coordinates" value={`${item.latitude}, ${item.longitude}`} />
                  </div>

                  <div className="mechActions">
                    <button
                      className="btn"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${item.latitude},${item.longitude}`,
                          "_blank"
                        )
                      }
                    >
                      Google Maps
                    </button>

                    <button
                      className="btn"
                      onClick={() =>
                        window.open(
                          `https://maps.apple.com/?q=${item.latitude},${item.longitude}`,
                          "_blank"
                        )
                      }
                    >
                      Apple Maps
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}