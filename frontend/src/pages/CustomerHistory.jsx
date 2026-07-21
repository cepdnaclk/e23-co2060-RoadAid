import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { getAuth } from "../auth";
import RoadAidLogo from "../components/RoadAidLogo";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();

  return (
    <span className={`statusBadge status-${s}`}>
      <span className="statusDot" />
      {status}
    </span>
  );
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

export default function CustomerHistory() {
  const nav = useNavigate();
  const { username } = getAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingValues, setRatingValues] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submittingRatingId, setSubmittingRatingId] = useState(null);

  function openInGoogleMaps(lat, lng) {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  }

  function openInAppleMaps(lat, lng) {
    window.open(`https://maps.apple.com/?q=${lat},${lng}`, "_blank");
  }

  async function loadHistory() {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/requests/my/history/");
      const items = Array.isArray(res.data) ? res.data : [];
      setHistory(items);

      setRatingValues((prev) => {
        const next = { ...prev };
        items.forEach((item) => {
          if (!next[item.id]) next[item.id] = "5";
        });
        return next;
      });
    } catch (err) {
      setHistory([]);
      setError(getApiErrorMessage(err, "Could not load your request history."));
    } finally {
      setLoading(false);
    }
  }

  async function rateRequest(requestId) {
    setMessage("");
    setError("");

    const numericRating = parseInt(ratingValues[requestId] || "5", 10);

    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      setError("Rating must be a number between 1 and 5.");
      return;
    }

    setSubmittingRatingId(requestId);

    try {
      await api.post(`/requests/${requestId}/rate/`, {
        rating: numericRating,
      });
      setMessage(`Rating submitted for request #${requestId}.`);
      await loadHistory();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit rating right now."));
    } finally {
      setSubmittingRatingId(null);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="page">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <RoadAidLogo />
            <div className="brandText">
              <h1>RoadAid</h1>
              <p>Customer service history</p>
            </div>
          </div>

          <div className="row">
            <span className="pill ok">{username}</span>
            <button className="btn" onClick={() => nav("/customer")}>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h2>My Service History</h2>
            <button className="btn" onClick={loadHistory} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="cardBody">
            {error && <div className="alertBox alertError">{error}</div>}
            {message && <div className="alertBox alertSuccess">{message}</div>}

            {loading ? (
              <div className="hint">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="hint">No previous requests yet.</div>
            ) : (
              <div className="historyList">
                {history.map((item) => {
                  const alreadyRated = item.rating !== null && item.rating !== undefined;

                  return (
                    <div key={item.id} className="historyCard">
                      <div className="requestTop">
                        <div>
                          <div className="requestId">Request #{item.id}</div>
                          <div className="requestTitle">
                            {item.problem_type_display || item.problem_type || "Request"}
                          </div>

                          <div className="requestMeta">
                            Vehicle: {item.vehicle_type_display || item.vehicle_type || "-"}
                          </div>

                          {item.custom_problem && (
                            <div className="requestMeta">
                              Custom problem: {item.custom_problem}
                            </div>
                          )}

                          {item.description && (
                            <div className="requestMeta">
                              Notes: {item.description}
                            </div>
                          )}

                          <div className="requestMeta">
                            Submitted: {formatDate(item.created_at)}
                          </div>

                          {item.completed_at && (
                            <div className="requestMeta">
                              Completed: {formatDate(item.completed_at)}
                            </div>
                          )}

                          {alreadyRated && (
                            <div className="requestMeta">
                              Your rating: {item.rating}/5
                            </div>
                          )}

                          {alreadyRated && item.review_comment && (
                            <div className="requestMeta">
                              Review: {item.review_comment}
                            </div>
                          )}
                        </div>

                        <StatusBadge status={item.status} />
                      </div>

                      <div className="actionRowSingleLine" style={{ marginTop: 14 }}>
                        <button
                          className="btn"
                          onClick={() => openInGoogleMaps(item.latitude, item.longitude)}
                        >
                          Open in Google Maps
                        </button>

                        <button
                          className="btn"
                          onClick={() => openInAppleMaps(item.latitude, item.longitude)}
                        >
                          Open in Apple Maps
                        </button>

                        {item.status === "completed" && !alreadyRated && (
                          <>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              className="input historyRatingInput"
                              value={ratingValues[item.id] || "5"}
                              onChange={(e) =>
                                setRatingValues((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              placeholder="1-5"
                            />

                            <button
                              className="btn btnPrimaryDark"
                              onClick={() => rateRequest(item.id)}
                              disabled={submittingRatingId === item.id}
                            >
                              {submittingRatingId === item.id ? "Submitting..." : "Rate"}
                            </button>
                          </>
                        )}

                        {item.status === "completed" && alreadyRated && (
                        <div className="historyRatedBadgeWrap">
                            <span className="historyRatedBadge">Already Rated</span>
                        </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
